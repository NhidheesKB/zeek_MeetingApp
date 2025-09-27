<template>
  <div class="min-h-screen bg-gray-100 flex flex-col">
    <Navbar link="/available-meetings" message="Available Meeting" />
    <div class="flex-1 flex flex-col items-center justify-center space-y-8">
      <div class="flex flex-col items-center">
        <div class="relative flex items-center justify-center" @click="toggleMic">
          <div
            v-if="micOn"
            class="absolute w-40 h-40 rounded-full bg-red-400 opacity-30 animate-ping"
          ></div>
          <button
            class="relative z-10 w-24 h-24 rounded-full flex items-center justify-center shadow-lg transition duration-300"
            :class="micOn ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-300 hover:bg-gray-400'"
          >
            <svg class="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path
                d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 14 0h-2zM11 19h2v3h-2v-3z"
              />
            </svg>
          </button>
        </div>
        <p class="mt-6 text-lg font-medium text-gray-700">
          {{ micOn ? 'Recording...' : 'Tap mic to start' }}
        </p>
      </div>

      <div class="flex flex-col items-center space-y-4">
        <a
          v-if="showGenerateButton"
          class="px-6 py-3 cursor-default bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition duration-300"
          :href="pdfLink"
          download="meeting-report.pdf"
        >
          Download Meeting Report
        </a>
        <p
          v-if="reportMessage"
          :class="reportError ? 'text-red-600' : 'text-green-600'"
          class="text-lg"
        >
          {{ reportMessage }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { SharedProps } from '@adonisjs/inertia/types'
import { usePage } from '@inertiajs/vue3'
import Navbar from '../component/Navbar.vue'
let chunks: Blob[] = []
let stream: MediaStream | null = null
let mediarecorder: MediaRecorder | null = null
const { meetingid } = defineProps<{
  meetingid: string
}>()
const page = usePage<SharedProps>()
const csrfToken = ref(page.props.csrfToken)
const micOn = ref(false)
const showGenerateButton = ref(false)
const reportMessage = ref('')
const pdfLink = ref('')
const reportError = ref(false)
function toggleMic() {
  micOn.value = !micOn.value
}
function generateReport(pdfblob: Blob) {
  const url = URL.createObjectURL(pdfblob)
  pdfLink.value = url
}
async function recorder() {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    chunks = []
    mediarecorder = new MediaRecorder(stream)
    mediarecorder.start()
    mediarecorder.ondataavailable = (e: BlobEvent) => {
      if (e.data.size > 0) chunks.push(e.data)
    }
    mediarecorder.onstop = () => {
      const audioblob = new Blob(chunks, { type: 'audio/webm' })
      sendaudio(audioblob)
    }
  } catch (error) {
    window.alert(`Microphone error: ${error.message}`)
    toggleMic()
  }
}

async function sendaudio(audioblob: Blob) {
  try {
    const formData = new FormData()
    formData.append('recorder', audioblob)
    formData.append('meetingid', meetingid)

    const response = await fetch('/upload', {
      method: 'POST',
      body: formData,
      credentials:'include'
    })
    console.log("res",response)
    const contentType = response.headers.get('Content-Type') || ''

    if (!response.ok) {
      if (contentType.includes('application/json')) {
        const error = await response.json()
        reportError.value = true
        reportMessage.value = error.message
      } else {
        reportError.value = true
        reportMessage.value = `Unexpected error: ${await response.text()}`
      }
      return
    }

    if (contentType.includes('application/pdf')) {
      const pdfblob = await response.blob()
      showGenerateButton.value = true
      generateReport(pdfblob)
      return
    }

    if (contentType.includes('application/json')) {
      const res = await response.json()
      reportError.value = false
      reportMessage.value = res.message
      return
    }

    reportError.value = true
    reportMessage.value = 'Unexpected response from server.'
  } catch (error) {
    reportError.value = true
    reportMessage.value = error.message
    console.error('Client error:', error)
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
