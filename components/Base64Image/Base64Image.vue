<script lang="ts" setup>
const props = defineProps<{ path: string, extension: string }>()
const emits = defineEmits<{ click: [] }>()

function handleClick() {
  emits('click')
}
const imageUrl = ref<string>('')

async function fetchImageFromApi() {
  try {
    const response = await $fetch<{ base64: string }>(`/api/image/${props.path}`, {
      params: {
        extension: props.extension,
      },
    })
    imageUrl.value = response.base64
  }
  catch (error) {
    console.error(error)
  }
}

onMounted(() => {
  fetchImageFromApi()
})
</script>

<template>
  <img
    :src="imageUrl"
    v-bind="$attrs"
    @click="handleClick"
    @error.prevent
  >
</template>
