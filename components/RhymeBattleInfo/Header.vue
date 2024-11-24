<script lang="ts" setup>
const props = defineProps<{
  id: string | null
  status: 'pending' | 'idle' | 'error' | 'success'
  name?: string
}>()
</script>

<template>
  <div class="flex flex-row items-center gap-2 rounded-lg py-2">
    <img
      v-if="props.id && props.status === 'success'" :src="`/${props.id}/profile.jpeg`"
      class="shadow-xl drop-shadow-xl inline-flex items-center justify-center font-normal
      text-primary select-none shrink-0 bg-secondary overflow-hidden h-10 w-10 text-xs rounded-full"
      alt="profile" @error.prevent
    >
    <Skeleton
      v-else class="shadow-xl drop-shadow-xl inline-flex items-center justify-center font-normal text-primary
       select-none shrink-0 bg-secondary overflow-hidden h-10 w-10 rounded-full"
    />

    <h1 v-if="props.status === 'success'" class="text-xl font-bold">
      {{ props.name }}
    </h1>
    <Skeleton v-else class="w-44 h-7 shrink-0" />
  </div>
</template>
