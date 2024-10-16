<script lang="ts" setup>
import type { DrawerRootEmits, DrawerRootProps } from 'vaul-vue'
import { useForwardPropsEmits } from 'radix-vue'
import { DrawerRoot } from 'vaul-vue'

const { shouldScaleBackground = false, ...props } = defineProps<DrawerRootProps>()

const emits = defineEmits<DrawerRootEmits>()

const forwarded = useForwardPropsEmits(props, emits)
</script>

<template>
  <DrawerRoot :should-scale-background="shouldScaleBackground" v-bind="forwarded">
    <slot />
  </DrawerRoot>
</template>
