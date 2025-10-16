<template>
  <div class="min-h-screen bg-gray-100 flex flex-col">
    <Navbar link="/available-meetings" message="Available Meeting" />

    <div class="flex-1 flex flex-col items-center justify-center space-y-8">
      <div class="flex flex-col items-center">
        <div class="relative flex items-center justify-center" @click="toggleMic">
          <div v-if="micOn" class="absolute w-40 h-40 rounded-full bg-red-400 opacity-30 animate-ping"></div>

          <button
            class="relative z-10 w-24 h-24 rounded-full flex items-center justify-center shadow-lg transition duration-300"
            :class="micOn ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-300 hover:bg-gray-400'" :disabled="isProcessing">
            <svg class="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path
                d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 14 0h-2zM11 19h2v3h-2v-3z" />
            </svg>
          </button>
        </div>

        <p class="mt-6 text-lg font-medium text-gray-700">
          {{ micOn ? 'Recording...' : 'Tap mic to start' }}
        </p>
        <div v-if="isProcessing" class="mt-4 flex items-center space-x-2 text-blue-600">
          <svg class="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none"
            viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
          </svg>
          <span class="text-lg font-medium animate-pulse">
            Processing your meeting report...
          </span>
        </div>
      </div>

      <div class="flex flex-col items-center space-y-4">
        <a v-if="showGenerateButton"
          class="px-6 py-3 cursor-default bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition duration-300"
          :href="pdfLink" :download="fileName">
          Download Meeting Report
        </a>
        <p v-if="reportMessage" :class="reportError ? 'text-red-600' : 'text-green-600'" class="text-lg text-center">
          {{ reportMessage }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import Navbar from '../component/Navbar.vue'
let stream: MediaStream | null = null
let mediarecorder: MediaRecorder | null = null
const { meetingid } = defineProps<{ meetingid: string }>()
const micOn = ref(false)
const isProcessing = ref(false)
const showGenerateButton = ref(false)
const reportMessage = ref('')
const pdfLink = ref('')
const fileName = ref('')
const reportError = ref(false)

function toggleMic() {
  if (isProcessing.value) return
  micOn.value = !micOn.value
}

function generateReport(pdfblob: Blob) {
  const url = URL.createObjectURL(pdfblob)
  pdfLink.value = url
}

async function recorder() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const wsUrl = `${protocol}://${window.location.host}/upload`;
    const ws = new WebSocket(wsUrl);
    ws.onopen = () => {
      mediarecorder = new MediaRecorder(stream as MediaStream, { mimeType: "audio/webm" })
      mediarecorder.start(10000)
      mediarecorder.ondataavailable = async (e: BlobEvent) => {
        if (e.data.size > 0 && ws?.readyState === WebSocket.OPEN) {
          const arraybuffer = await e.data.arrayBuffer()
          ws.send(arraybuffer)
        }
      }
      mediarecorder.onstop = async () => {
        isProcessing.value = true
        reportMessage.value = ''
        reportError.value = false
        showGenerateButton.value = false
        ws.send(JSON.stringify({ meetingid }))
      }
      ws.onerror = (err) => console.error("WS error", err)
      ws.onmessage = (event) => {
        isProcessing.value = false
        if (typeof (event.data) == 'string') {
          const data = JSON.parse(event.data)
          if (data.type == 'error') {
            reportError.value = true
            reportMessage.value = data.message || 'Failed to generate report.'
            return ws.close()
          }
          if (!!data.pdfName)
            return fileName.value = data.pdfName
        }
        showGenerateButton.value = true
        reportMessage.value = 'Meeting report is ready for download.'
        const pdfblob = new Blob([event.data], { type: 'application/pdf' })
        generateReport(pdfblob)
        ws.close()

      }
    }
  }
  catch (error) {
    window.alert(`Microphone error: ${error.message}`)
    toggleMic()
  }
}

watch(micOn, async (ismicon) => {
  if (ismicon) {
    reportError.value = false
    showGenerateButton.value = false
    reportMessage.value = ''
    await recorder()
  } else if (mediarecorder && mediarecorder.state !== 'inactive') {
    mediarecorder.stop()
    stream?.getTracks().forEach((track) => track.stop())
  }
})
</script>
