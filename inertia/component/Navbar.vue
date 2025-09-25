<template>
  <nav class="bg-white shadow-md px-6 py-4 flex justify-between items-center">
      <h1 class="text-xl md:text-2xl font-bold text-blue-600">
        Zeekers Meeting App
      </h1>
      <div>
        <a
          :href="link"
          class="text-gray-700 font-medium hover:text-blue-600 transition"
        >
        {{ message }}
        </a>
      </div>
    </nav>
</template>
<script setup lang="ts">
defineProps<{
  link:string,
  message:string
}>()
</script>
