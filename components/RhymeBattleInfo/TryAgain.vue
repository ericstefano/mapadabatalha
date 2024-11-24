<script lang="ts" setup>
const emit = defineEmits<{ refresh: [] }>()
</script>

<template>
  <div class="w-full flex flex-col mt-1 col-span-2">
    <p class="text-red-400 text-sm mb-4 text-center select-none">
      <slot />
    </p>
    <Button variant="outline" class="mx-auto" @click.capture.prevent="emit('refresh')">
      Tentar novamente
    </Button>
  </div>
</template>
