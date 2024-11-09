<script setup lang="ts">
interface RhymeBattleInfoProps {
  active: string | null
}

const props = defineProps<RhymeBattleInfoProps>()
const emits = defineEmits<{
  'update:active': [active: string | null]
}>()

const active = useVModel(props, 'active', emits, {
  passive: true,
})

const page = ref(1)
const perPage = ref(2)
const imageError = ref(false)
/*
  Keep data, reactive key issues:
  https://github.com/nuxt/nuxt/issues/14507
  https://github.com/nuxt/nuxt/issues/21532
  https://github.com/nuxt/nuxt/issues/24332
  https://github.com/nuxt/nuxt/issues/22348

*/
type GetInstagramPostsResponse = Awaited<ReturnType<typeof getInstagramPosts>>
const parsedPosts = useState<GetInstagramPostsResponse['data']>(() => [])

// eslint-disable-next-line unused-imports/no-unused-vars
async function getInstagramPosts() {
  return $fetch(`/api/rhyme-battles/${active.value}/instagram-posts`, {
    params: {
      page: page.value,
      perPage: perPage.value,
    },
    async onResponse({ response }) {
      parsedPosts.value = [...parsedPosts.value, ...response._data.data]
    },
  })
}

const { data: posts, status: postsStatus, refresh: refreshPosts } = await useFetch(`/api/rhyme-battles/${active.value}/instagram-posts`, {
  params: {
    page,
    perPage,
  },
  server: false,
  lazy: true,
  async onResponse({ response }) {
    parsedPosts.value = [...parsedPosts.value, ...response._data.data]
  },
})

const { data: battleData, status: battleStatus } = useFetch(`/api/rhyme-battles/${active.value}`, {
  server: false,
  lazy: true,
})

onMounted(() => {
  parsedPosts.value = []
  page.value = 1
  perPage.value = 2
})

const hasData = computed(() => Boolean(active.value && battleData.value && posts.value?.data && posts.value.data.length))

function increasePage() {
  page.value = page.value + 1
}

function handleImageError() {
  imageError.value = true
}
</script>

<template v-if="hasData">
  <div class="flex flex-row items-center gap-2 rounded-lg py-2 px-0">
    <img
      v-if="active && battleStatus === 'success' && !imageError" :src="`/${active}/profile.jpeg`"
      class="shadow-xl drop-shadow-xl inline-flex items-center justify-center font-normal text-primary select-none shrink-0 bg-secondary overflow-hidden h-10 w-10 text-xs rounded-full"
      alt="profile"
      @error.prevent="handleImageError"
    >
    <Skeleton v-else-if="battleStatus === 'pending'" class="shadow-xl drop-shadow-xl h-10 w-10 rounded-full shrink-0" />
    <div
      v-else
      class="shadow-xl drop-shadow-xl inline-flex items-center justify-center font-normal text-primary select-none shrink-0 bg-secondary overflow-hidden h-10 w-10 text-xs rounded-full"
    />
    <h1 v-if="battleStatus === 'success'" class="text-xl font-bold">
      {{ battleData?.name }}
    </h1>
    <Skeleton v-else-if="battleStatus === 'pending'" class="w-44 h-7" />
  </div>
  <div class="h-full w-full flex flex-col max-h-screen overscroll-none">
    <p class="text-muted-foreground mb-2">
      Postagens
    </p>
    <div
      class="flex gap-4 max-h-80 scroll-smooth overflow-y-hidden overflow-x-auto lg:overflow-y-auto lg:overflow-x-hidden lg:grid lg:grid-cols-2 lg:justify-center overscroll-none"
    >
      <NuxtLink
        v-for="post in parsedPosts" :key="post.id"
        class="hover:scale-[1.02] transition-all shrink-0 h-full grow-1 aspect-square" :href="post.href" target="blank"
      >
        <!-- <NuxtIMg
          v-if="id" class="object-cover aspect-square h-full rounded-sm"
          :src="`/posts/${post.rhymeBattleId}/${post.id}.jpeg`" :alt="post.alt"
        > -->
        <img
          v-if="active" class="object-cover aspect-square h-full rounded-sm overflow-hidden text-ellipsis"
          :src="`/${post.rhymeBattleId}/${sanitizeId(post.id)}.jpeg`" :alt="post.alt"
        >
      </NuxtLink>
      <Button
        v-if="hasData && postsStatus === 'success' && page < posts?.totalPages" type="button" variant="outline"
        class="h-full aspect-square lg:aspect-auto focus:bg-transparent lg:col-span-2" @click="increasePage"
      >
        Ver mais postagens
      </Button>
      <template v-if="postsStatus === 'pending'">
        <Skeleton
          v-for="number in Array.from({ length: perPage }, (_, index) => index)" :key="number"
          class="min-w-full aspect-square rounded-sm"
        />
      </template>
    </div>

    <p v-if="postsStatus === 'success' && !hasData" class="text-sm mt-1">
      Nenhuma postagem encontrada.
    </p>
    <div v-if="postsStatus === 'error'" class="w-full flex flex-col mt-1">
      <p class="text-red-400 text-sm mb-4">
        Erro ao buscar as postagens. Por favor, tente novamente.
      </p>
      <Button variant="outline" class="mx-auto" @click="refreshPosts">
        Tentar novamente
      </Button>
    </div>
  </div>
</template>
