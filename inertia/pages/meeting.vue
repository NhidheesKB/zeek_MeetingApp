<template>
  <div class="min-h-screen bg-gray-100 flex flex-col">
    <Navbar link="/available-meetings" message="Available Meeting" />
    <div class="flex-1 flex items-center justify-center pt-4">
      <div class="bg-white rounded-2xl shadow-lg w-full max-w-2xl p-6 md:p-10">
        <h2 class="text-2xl md:text-3xl font-bold text-blue-600 mb-6 text-center">
          Add Meeting Details
        </h2>
        <form class="space-y-6" action="/meeting" method="POST" @submit.prevent="handleSubmit" autocomplete="off">
          <input type="hidden" name="_csrf" :value="csrfToken" />

          <div v-for="(field, index) in formFields" :key="index" class="relative">
            <label :for="field.toLowerCase()" class="block text-gray-700 font-medium mb-2">
              Meeting {{ field }}
            </label>

            <input v-if="field !== 'Participants'" :type="field === 'Date' ? 'date' : 'text'" :id="field.toLowerCase()"
              :name="field.toLowerCase()" :placeholder="`Enter the Meeting ${field}`" required
              class="w-full px-4 py-3 rounded-lg bg-gray-100 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-700 shadow-sm" />

            <div v-else>
              <div class="relative">
                <input type="text" v-model="participantName" placeholder="Enter participant name"
                  class="w-full px-4 py-3 rounded-lg bg-gray-100 border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 text-gray-700 shadow-sm" />
                <button type="button"
                  class="absolute right-0.5 top-1/2 -translate-y-1/2 rounded-2xl bg-blue-600 text-white px-3 py-1.5 text-sm hover:bg-blue-700 transition"
                  @click="addParticipant">
                  Add
                </button>
              </div>

              <div v-for="(p, i) in participants" :key="i">
                <input type="hidden" name="participants[]" :value="p" />
              </div>

              <p v-if="participants.length" class="mt-2 text-gray-700">
                Participants: {{ participants.join(', ') }}
              </p>

              <p v-else-if="showParticipantError" class="mt-2 text-red-500 text-sm font-medium">
                Please enter at least one participant.
              </p>
            </div>
          </div>

          <button type="submit"
            class="w-full py-3 bg-blue-600 text-white font-semibold text-lg rounded-lg hover:bg-blue-700 transition duration-300 shadow-md">
            Create Meeting
          </button>
        </form>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import flatpickr from 'flatpickr'
import type { SharedProps } from '@adonisjs/inertia/types'
import { usePage } from '@inertiajs/vue3'
import { onMounted, ref } from 'vue'
import Navbar from '../component/Navbar.vue'
const page = usePage<SharedProps>()
const csrfToken = ref(page.props.csrfToken)

const formFields = ref(['Title', 'Date', 'Time', 'Participants'])

const participants = ref<string[]>([])
const participantName = ref('')
const showParticipantError = ref(false)

function handleSubmit(e: Event) {
  if (participants.value.length === 0) {
    showParticipantError.value = true
    return
  }
  showParticipantError.value = false
  const form = e.target as HTMLFormElement
  form.submit()
}

onMounted(() => {
  flatpickr('#time', {
    enableTime: true,
    noCalendar: true,
    dateFormat: 'h:i K',
    time_24hr: false,
  })
})

function addParticipant() {
  const name = participantName.value.trim()
  if (name && !participants.value.includes(name)) {
    participants.value.push(name)
  }
  participantName.value = ''
}
</script>