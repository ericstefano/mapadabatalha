<script setup lang="ts">
interface RhymeBattleInfoProps {
  id: string | null
}
const { id } = defineProps<RhymeBattleInfoProps>()
const page = ref(1)
const perPage = ref(2)
const posts = ref([])
const { data: postsData, status } = useFetch(`/api/rhyme-battles/${id}/instagram-posts`, {
  params: {
    page,
    perPage,
  },
  server: false,
  onResponse({ response }) {
    posts.value = [...posts.value, ...response._data.data]
  },
})
const { data: battleData } = useFetch(`/api/rhyme-battles/${id}`, {
  server: false,
})

const hasData = computed(() => !!id && posts.value.length && battleData.value)

async function increasePage() {
  page.value = page.value + 1
}
</script>

<template>
  <template v-if="hasData" />
  <div class="flex flex-row items-center gap-2 rounded-lg py-2 px-0">
    <img
      v-if="id" :src="`/${id}/profile.jpeg`"
      class="shadow-xl drop-shadow-xl inline-flex items-center justify-center font-normal text-primary select-none shrink-0 bg-secondary overflow-hidden h-10 w-10 text-xs rounded-full"
      alt="profile"
    >
    <h1 class="text-xl font-bold">
      {{ battleData?.name }}
    </h1>
  </div>
  <div class="h-full w-full flex flex-col max-h-screen overscroll-none">
    <p class="text-muted-foreground mb-2">
      Postagens
    </p>
    <div
      class="flex gap-4 max-h-80 scroll-smooth overflow-y-hidden overflow-x-auto lg:overflow-y-auto lg:overflow-x-hidden lg:grid lg:grid-cols-2 lg:justify-center overscroll-none"
    >
      <NuxtLink
        v-for="post in posts" :key="post.id"
        class="hover:scale-[1.02] transition-all shrink-0 h-full grow-1 aspect-square" :href="post.href" target="blank"
      >
        <!-- <NuxtIMg
          v-if="id" class="object-cover aspect-square h-full rounded-sm"
          :src="`/posts/${post.rhymeBattleId}/${post.id}.jpeg`" :alt="post.alt"
        > -->
        <img
          v-if="id" class="object-cover aspect-square h-full rounded-sm overflow-hidden"
          :src="`/${post.rhymeBattleId}/${post.id}.jpeg`" :alt="post.alt"
        >
      </NuxtLink>
      <Button
        v-if="hasData && status !== 'pending' && page < postsData?.totalPages" type="button" variant="outline"
        class="h-full aspect-square lg:aspect-auto focus:bg-transparent lg:col-span-2" @click="increasePage"
      >
        Ver mais postagens
      </Button>
      <template v-if="status === 'pending'">
        <Skeleton
          v-for="number in Array.from({ length: perPage }, (_, index) => index)" :key="number"
          class="min-h-full aspect-square rounded-sm"
        />
      </template>
    </div>
    <p v-if="status === 'error' || (!hasData && status === 'success')" class="text-center text-sm">
      Nenhuma postagem encontrada.
    </p>
  </div>
</template>
