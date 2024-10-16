<script setup lang="ts">
import { APP_NAME } from '~/constants'

useHead({
  title: APP_NAME,
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
