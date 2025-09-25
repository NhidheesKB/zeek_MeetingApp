<template>
  <div class="min-h-screen flex items-center justify-center">
    <div
      class="bg-white rounded-3xl shadow-xl flex flex-col md:flex-row overflow-hidden max-w-screen-xl w-full mx-4 min-h-[600px]"
    >
      <div class="hidden lg:flex md:w-1/2 w-full">
        <img
          src="https://storage.googleapis.com/devitary-image-host.appspot.com/15848031292911696601-undraw_designer_life_w96d.svg"
          alt="Welcome"
          class="object-cover h-full w-full"
        />
      </div>

      <div class="lg:w-1/2 w-full flex flex-col justify-center p-12 bg-white">
        <h2 class="text-4xl font-extrabold text-blue-600 mb-10 text-center">Welcome Back</h2>

        <form class="space-y-6" action="/login" method="POST">
          <input type="hidden" name="_csrf" v-model="csrfToken" />
          <div class="relative" v-for="(value, index) in formFields" :key="index">
            <img
              :src="value.src"
              :name="value.label"
              class="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 opacity-70"
            />
            <input
              :type="value.label"
              :name="value.label"
              :placeholder="value.label == 'email' ? 'Email' : 'Password'"
              v-model="user[value.label]"
              class="pl-12 pr-4 py-3 w-full rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 text-base shadow-sm transition duration-200"
            />
          </div>
          <button
            type="submit"
            class="w-full py-3 bg-blue-500 text-white font-semibold text-lg rounded-lg hover:bg-blue-600 transition duration-300 shadow-md"
          >
            Log In
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import type { SharedProps } from '@adonisjs/inertia/types'
import { usePage } from '@inertiajs/vue3'

const page = usePage<SharedProps>()
const user = reactive({
  email: '',
  password: '',
})

const csrfToken = ref(page.props.csrfToken)
const formFields:Record<string,string> = ref([
  {
    label: 'email',
    src: 'https://cdn-icons-png.flaticon.com/512/561/561127.png',
  },
  {
    label: 'password',
    src: 'https://cdn-icons-png.flaticon.com/512/3064/3064155.png',
  },
])
</script>
