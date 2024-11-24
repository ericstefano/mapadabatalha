<script lang="ts" setup>
import { ref, watch } from 'vue'

const props = defineProps<{ show: boolean }>()
const emit = defineEmits<{ 'update:show': [boolean] }>()

const internalShow = ref(props.show)

watch(() => props.show, (newValue) => {
  internalShow.value = newValue
})

function hide() {
  internalShow.value = false
  emit('update:show', false) // Still emit for parent sync, but don't depend on it
}
</script>

<template>
  <div
    v-show="internalShow"
    class="min-h-full w-full absolute top-0 bottom-0 backdrop-blur-sm rounded-md flex
     items-center justify-center flex-col gap-4 transition-all duration-150 select-none text-foreground"
  >
    <p class="text-sm text-center max-w-sm px-16">
      ⚠️ Análise marcada como potencialmente irrelevante para esta batalha.
    </p>
    <Button
      size="sm"
      class="bg-yellow-400 hover:bg-yellow-500 text-primary-foreground"
      variant="secondary"
      @click="hide"
    >
      Ver mesmo assim
    </Button>
  </div>
</template>
