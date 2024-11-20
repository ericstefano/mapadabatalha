<script setup lang="ts">
import type { Locale } from 'date-fns'
import type { GetInstagramPostsResponse } from './~types'
import { intlFormat, parseISO } from 'date-fns'
import { INSTAGRAM_BASE_URL } from '~/constants'

const props = defineProps<RhymeBattleInfoProps>()

const emits = defineEmits<{
  'update:active': [active: string | null]
}>()

function formatDate(date: Date) {
  return intlFormat(date, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
  }, {
    locale: 'pt-BR',
  })
}

interface RhymeBattleInfoProps {
  active: string | null
}

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
const storedPosts = useState<GetInstagramPostsResponse['data']>(() => [])
const { data: battle, status: battleStatus } = useFetch(`/api/rhyme-battles/${active.value}`, {
  server: false,
  lazy: true,
})

const scrapePosts = useFetch(`/api/rhyme-battles/${active.value}/scrape-posts`, {
  method: 'POST',
  server: false,
})
const instagramPosts = useFetch(`/api/rhyme-battles/${active.value}/instagram-posts`, {
  params: {
    page,
    perPage,
  },
  server: false,
  lazy: true,
  immediate: false,
  watch: [scrapePosts.status],
  async onResponse({ response }) {
    storedPosts.value = [...storedPosts.value, ...response._data.data]
  },
})
const hasPostsData = computed(() => Boolean(active.value && battle.value && instagramPosts.data.value && instagramPosts.data.value.data && instagramPosts.data.value.data.length))
const hasPostsSkeletons = computed(() => instagramPosts.status.value === 'pending' || instagramPosts.status.value === 'idle')
const hasShowMorePosts = computed(() => instagramPosts.status.value === 'success' && hasPostsData && instagramPosts.data?.value?.totalPages && page.value < instagramPosts.data.value.totalPages)
const hasNoPostsFound = computed(() => instagramPosts.status.value === 'success' && !hasPostsData.value)
const hasPostsError = computed(() => instagramPosts.status.value === 'error')

const analysePosts = useFetch(`/api/rhyme-battles/${active.value}/analyse-posts`, {
  method: 'POST',
  immediate: false,
  server: false,
  lazy: true,
})
const postAnalyses = useFetch(`/api/rhyme-battles/${active.value}/post-analyses`, {
  server: false,
  lazy: true,
})

const parsedPostAnalyses = computed(() => postAnalyses.data.value?.map((analysis) => {
  const errors = Object.keys(analysis?.errors ?? [])
  let dateString: string | null = null
  let location: string | null = null
  if (analysis.parsedContent) {
    const split = analysis.parsedContent.split(',')
    dateString = split[0]
    location = split[1]
  }
  const hasContent = dateString !== 'null' && location !== 'null'
  const hasError = Boolean(errors.length)
  return {
    errors,
    dateString,
    location,
    instagramHref: `${INSTAGRAM_BASE_URL}/p/${analysis.instagramPostId}`,
    id: analysis.id,
    model: analysis.model,
    rawContent: analysis.rawContent,
    totalCost: analysis.totalCost,
    hasContent,
    hasError,
  }
}))

watch(parsedPostAnalyses, () => {
  console.log(parsedPostAnalyses.value)
})

function increasePage() {
  page.value = page.value + 1
}

function handleImageError() {
  imageError.value = true
}

watch(postAnalyses.data, async () => {
  if (!postAnalyses.data.value?.length) {
    postAnalyses.clear()
    await analysePosts.execute()
    await postAnalyses.execute()
  }
})

onMounted(() => {
  storedPosts.value = []
  page.value = 1
  perPage.value = 2
})
</script>

<template>
  <div class="flex flex-row items-center gap-2 rounded-lg py-2 px-0">
    <img
      v-if="active && battleStatus === 'success' && !imageError" :src="`/${active}/profile.jpeg`"
      class="shadow-xl drop-shadow-xl inline-flex items-center justify-center font-normal text-primary select-none shrink-0 bg-secondary overflow-hidden h-10 w-10 text-xs rounded-full"
      alt="profile" @error.prevent="handleImageError"
    >
    <Skeleton v-else-if="battleStatus === 'pending'" class="shadow-xl drop-shadow-xl h-10 w-10 rounded-full shrink-0" />
    <div
      v-else
      class="shadow-xl drop-shadow-xl inline-flex items-center justify-center font-normal text-primary select-none shrink-0 bg-secondary overflow-hidden h-10 w-10 text-xs rounded-full"
    />
    <h1 v-if="battleStatus === 'success'" class="text-xl font-bold">
      {{ battle?.name }}
    </h1>
    <Skeleton v-else-if="battleStatus === 'pending'" class="w-44 h-7" />
  </div>
  <div class="h-full w-full flex flex-col max-h-screen overscroll-none">
    <p class="text-muted-foreground mb-2">
      Postagens
    </p>
    <div class="max-h-40 min-h-40 lg:max-h-80 lg:min-h-80 overscroll-none scroll-smooth overflow-y-hidden overflow-x-auto lg:overflow-y-auto lg:overflow-x-hidden">
      <div
        class="flex h-full gap-4 lg:grid lg:grid-cols-2 lg:grid-flow-dense lg:grid-rows-none lg:justify-center lg:h-auto "
      >
        <NuxtLink
          v-for="post in storedPosts" :key="post.id" draggable="false"
          class="hover:scale-[1.02] transition-all shrink-0 h-full grow-1 aspect-square" :href="post.href" target="blank"
        >
          <!-- <NuxtImg/> -->
          <img
            v-if="active"
            draggable="false"
            class="flex-1 select-none object-cover aspect-square h-full rounded-sm overflow-hidden text-ellipsis"
            :src="`/${post.rhymeBattleId}/${sanitizeId(post.id)}.jpeg`" :alt="post.alt ? post.alt : ''"
          >
        </NuxtLink>
        <Button
          v-if="hasShowMorePosts" type="button"
          variant="outline"
          class="flex-grow-0 flex-shrink-0 h-full aspect-square lg:aspect-auto focus:bg-transparent lg:col-span-2"
          @click="increasePage"
        >
          Ver mais postagens
        </Button>
        <template v-if="hasPostsSkeletons">
          <Skeleton
            v-for="number in Array.from({ length: perPage }, (_, index) => index)" :key="number"
            class="flex-grow flex-shrink-0 min-h-full aspect-square rounded-sm"
          />
        </template>
      </div>
    </div>
    <p v-if="hasNoPostsFound" class="text-sm mt-1">
      Nenhuma postagem encontrada.
    </p>
    <div v-if="hasPostsError" class="w-full flex flex-col mt-1">
      <p class="text-red-400 text-sm mb-4">
        Erro ao buscar as postagens. Por favor, tente novamente.
      </p>
      <Button variant="outline" class="mx-auto" @click="instagramPosts.refresh">
        Tentar novamente
      </Button>
    </div>
    <hr class="w-full mt-4 mb-2">
    <p class="text-muted-foreground mb-2">
      Análises
    </p>
    <div class="overflow-y-auto h-full min-h-40">
      <div class="flex flex-col gap-4">
        <p v-for="analysis in parsedPostAnalyses" :key="analysis.id" class="font-light text-sm">
          <template v-if="analysis.hasContent">
            O modelo
            <span class="text-yellow-400 font-bold">"{{ analysis.model }}"</span>
            analisou a imagem da
            <NuxtLink :href="analysis.instagramHref" class="underline cursor-pointer font-bold text-blue-400" target="_blank">
              postagem.
            </NuxtLink> <br> <br>Ele concluiu que a última ocorrência do evento aconteceu no dia <span class="font-bold">{{ formatDate(parseISO(analysis?.dateString)) }}</span>  no local <span class="font-bold">"{{ analysis.location }}"</span>.
          </template>
        </p>
        <!-- <div v-else>
          {{ analysis?.location }}
        </div> -->
      </div>
    </div>
  </div>
</template>
