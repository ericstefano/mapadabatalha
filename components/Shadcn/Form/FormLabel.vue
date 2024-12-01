<script lang="ts" setup>
import type { LabelProps } from 'radix-vue'
import type { HTMLAttributes } from 'vue'
import { Label } from '~/components/Shadcn/Label'
import { useFormField } from './useFormField'

const props = defineProps<LabelProps & { class?: HTMLAttributes['class'] }>()

const { formItemId } = useFormField()
</script>

<template>
  <Label
    :class="cn(
      props.class,
    )"
    :for="formItemId"
  >
    <slot />
  </Label>
</template>
