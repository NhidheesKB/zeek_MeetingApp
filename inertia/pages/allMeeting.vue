<template>
  <div class="min-h-screen bg-gray-100 flex flex-col">
    <Navbar link="/" message="Create Meeting" />
    <div class="flex-1 p-6 md:p-10">
      <h2 class="text-2xl font-bold text-gray-800 mb-6">
        {{ props.meetings.length > 0 ? 'Available Meetings' : 'No Upcomming Meetings' }}
      </h2>
      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="(meeting, index) in props.meetings"
          :key="index"
          @click="$inertia.get(`/?meetingid=${meeting.id}`)"
          class="bg-white hover:shadow-amber-700 rounded-xl shadow-md p-6 flex flex-col justify-between hover:shadow-lg transition"
        >
          <h3 class="text-lg font-semibold text-blue-600 mb-2">
            {{ meeting.title }}
          </h3>

          <p class="text-gray-600 text-sm mb-1">📅 {{ meeting.date }}</p>
          <p class="text-gray-600 text-sm mb-3">⏰ {{ meeting.time }}</p>
          <div class="mb-4">
            <p class="text-gray-700 font-medium mb-1">Participants:</p>
            <ul class="list-disc list-inside text-gray-600 text-sm">
              <li v-for="(p, i) in meeting.participants.split(',')" :key="i">
                {{ p }}
              </li>
            </ul>
          </div>
          <span
            class="inline-block px-3 py-1 text-xs font-medium rounded-full"
            :class="
              meeting.summary === null
                ? 'bg-red-200 text-gray-900'
                : 'bg-green-100 text-green-700'
            "
          >
            {{ meeting.summary===null?'Upcomming':'Completed' }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { SharedProps } from '@adonisjs/inertia/types'
import { usePage } from '@inertiajs/vue3'
import { InferPageProps } from '@adonisjs/inertia/types'
import Navbar from '../component/navbar.vue'
import DashboardController from '#controllers/dashboard_controller'
const page = usePage<SharedProps>()
const csrfToken = ref(page.props.csrfToken)
const props = defineProps<{
  meetings: InferPageProps<DashboardController, 'dashboard'>['meetings']
}>()
</script>
