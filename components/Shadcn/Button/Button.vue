<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { Primitive, type PrimitiveProps } from 'radix-vue'
import { type ButtonVariants, buttonVariants } from '.'

interface Props extends PrimitiveProps {
  variant?: ButtonVariants['variant']
  size?: ButtonVariants['size']
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()
</script>

<template>
  <Primitive :as="props.as || 'button'" :as-child="props.asChild" :class="cn(buttonVariants({ variant: props.variant, size: props.size }), props.class)">
    <slot />
  </Primitive>
</template>
