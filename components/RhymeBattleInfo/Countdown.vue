<script lang="ts" setup>
import { computed, onBeforeUnmount, ref } from 'vue'

const props = defineProps<{ toDate: Date }>()

const now = ref(new Date())

const timeDifference = computed(() => {
  const diff = props.toDate.getTime() - now.value.getTime()
  return diff > 0 ? diff : 0
})

const hours = computed(() => {
  return Math.floor(timeDifference.value / (1000 * 60 * 60))
    .toString()
    .padStart(2, '0')
})

const minutes = computed(() => {
  return Math.floor((timeDifference.value % (1000 * 60 * 60)) / (1000 * 60))
    .toString()
    .padStart(2, '0')
})

const seconds = computed(() => {
  return Math.floor((timeDifference.value % (1000 * 60)) / 1000)
    .toString()
    .padStart(2, '0')
})

const timer = setInterval(() => {
  now.value = new Date()
}, 1000)

onBeforeUnmount(() => {
  clearInterval(timer)
})
</script>

<template>
  <div class="flex justify-end">
    <div class="font-mono">
      {{ hours }}:{{ minutes }}:{{ seconds }}
    </div>
  </div>
</template>
