<script setup lang="ts">
import type { InputProps } from '../Input'

const props = defineProps<InputProps>()
const emits = defineEmits<{
  (e: 'update:modelValue', payload: string | number): void
}>()
const _props = toRef(props)
const modelValue = useVModel(props, 'modelValue', emits, {
  passive: true,
  defaultValue: props.defaultValue,
})

const show = ref(false)

function toggle() {
  show.value = !show.value
}
</script>

<template>
  <div :class="cn('relative flex items-center', props.class)">
    <Input v-bind="_props" v-model="modelValue" class="pr-11" :type="show ? 'text' : 'password'" />
    <Button class="absolute end-2 rounded-full p-1.5 h-auto" type="button" variant="ghost" aria-label="show-password" @click="toggle">
      <Icon v-if="show" size="1.25rem" name="lucide:eye" />
      <Icon v-if="!show" size="1.25rem" name="lucide:eye-off" />
    </Button>
  </div>
</template>
