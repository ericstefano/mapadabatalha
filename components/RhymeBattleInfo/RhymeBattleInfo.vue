<script setup lang="ts">
import type { EngineType } from 'embla-carousel'
import type { UnwrapRefCarouselApi } from '../Shadcn/Carousel/interface'
import type { GetInstagramPostsResponse } from './types'
import { isFuture, isPast, parseISO } from 'date-fns'
import { INSTAGRAM_BASE_URL } from '~/constants'
import { LLM_INFO_MAP } from '~/constants/llm'
import Divider from './Divider.vue'
import Header from './Header.vue'
import Subtitle from './Subtitle.vue'
import TryAgain from './TryAgain.vue'
import WarningOverlay from './WarningOverlay.vue'

const props = defineProps<{
  active: string | null
}>()

const emits = defineEmits<{
  'update:active': [active: string | null]
}>()

const active = useVModel(props, 'active', emits, {
  passive: true,
})

const page = ref(1)
const perPage = ref(2)

const { data: battle, status: battleStatus } = useFetch(`/api/rhyme-battles/${active.value}`, {
  server: false,
  lazy: true,
})

const hasBattle = computed(() => active.value && battle.value)
/*
  Storing posts because of reactive key issues, unable to cache the posts or extract the payload:
  https://github.com/nuxt/nuxt/issues/14507
  https://github.com/nuxt/nuxt/issues/21532
  https://github.com/nuxt/nuxt/issues/24332
  https://github.com/nuxt/nuxt/issues/22348
*/
const storedPosts = useState<GetInstagramPostsResponse['data']>(() => [])

const scrapePosts = useFetch(`/api/rhyme-battles/${active.value}/scrape-posts`, {
  method: 'POST',
  immediate: false,
  lazy: true,
  dedupe: 'defer',
})

const instagramPosts = useFetch(`/api/rhyme-battles/${active.value}/instagram-posts`, {
  params: {
    page,
    perPage,
  },
  server: false,
  lazy: true,
  dedupe: 'defer',
  async onResponse({ response }) {
    storedPosts.value = [...storedPosts.value, ...response._data.data]
  },
})
const hasPostsLoading = computed(() => scrapePosts.status.value === 'pending' || instagramPosts.status.value === 'pending')
const hasPostsData = computed(() => Boolean(hasBattle.value && instagramPosts.status.value === 'success'
  || (instagramPosts.data.value && instagramPosts.data.value.data.length)))
const hasNoPostsData = computed(() => !hasPostsData.value)
const hasPostsError = computed(() => instagramPosts.status.value === 'error')

const hasMorePosts = computed(() =>
  hasPostsData.value && instagramPosts.data.value?.totalPages
  && page.value < instagramPosts.data.value.totalPages,
)

const analysePosts = useFetch(`/api/rhyme-battles/${active.value}/analyse-posts`, {
  method: 'POST',
  immediate: false,
  server: false,
  lazy: true,
  dedupe: 'defer',
})
const postAnalyses = useFetch(`/api/rhyme-battles/${active.value}/post-analyses`, {
  server: false,
  lazy: true,
  dedupe: 'defer',
})
const hasPostAnalysesLoading = computed(() => analysePosts.status.value === 'pending' || postAnalyses.status.value === 'pending')
const hasPostAnalysesData = computed(() => Boolean(hasBattle.value && postAnalyses.status.value === 'success'
  && postAnalyses.data.value && postAnalyses.data.value.data && postAnalyses.data.value.data.length))
const hasNoPostAnalyses = computed(() => !hasPostAnalysesData.value)
const hasPostAnalysesError = computed(() => postAnalyses.status.value === 'error')

const parsedPostAnalyses = computed(() => {
  if (!postAnalyses.data.value || !postAnalyses.data.value.data.length)
    return []

  return postAnalyses.data.value.data.map((analysis) => {
    const errors = Object.keys(analysis?.errors ?? [])
    let dateString: string | null = null
    let location: string | null = null

    if (analysis.parsedContent) {
      const split = analysis.parsedContent.split(';')
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
      createdAt: analysis.createdAt,
      hasContent,
      hasError,
    }
  }).sort((a, b) => Number(a.hasError) - Number(b.hasError))
})

function increasePage() {
  page.value = page.value + 1
}

function watchSlides(emblaApi: NonNullable<UnwrapRefCarouselApi>) {
  function reloadEmbla(): void {
    const oldEngine = emblaApi.internalEngine()

    emblaApi?.reInit()
    const newEngine = emblaApi.internalEngine()
    const copyEngineModules: (keyof EngineType)[] = [
      'scrollBody',
      'location',
      'offsetLocation',
      'previousLocation',
      'target',
    ]

    copyEngineModules.forEach((engineModule) => {
      Object.assign(newEngine[engineModule], oldEngine[engineModule])
    })

    newEngine.translate.to(oldEngine.location.get())
    const { index } = newEngine.scrollTarget.byDistance(0, false)
    newEngine.index.set(index)
    newEngine.animation.start()
  }

  function reloadAfterPointerUp(): void {
    emblaApi.off('pointerUp', reloadAfterPointerUp)
    reloadEmbla()
  }

  const engine = emblaApi.internalEngine()

  if (hasMorePosts.value && engine.dragHandler.pointerDown()) {
    const boundsActive = engine.limit.reachedMax(engine.target.get())
    engine.scrollBounds.toggleActive(boundsActive)
    emblaApi.on('pointerUp', reloadAfterPointerUp)
  }
  else {
    reloadEmbla()
  }
}

function handleScrollEnd(api: UnwrapRefCarouselApi) {
  if (!hasMorePosts.value)
    return
  const lastSlide = (api?.slideNodes()?.length || 0) - 1
  const lastSlideInView = api?.slidesInView().includes(lastSlide)

  if (lastSlideInView) {
    increasePage()
  }
}

watch([postAnalyses.data, instagramPosts.data], async () => {
  if (instagramPosts.status.value === 'error' || postAnalyses.status.value === 'error')
    return

  if (instagramPosts.status.value === 'pending')
    return

  const hasPosts = instagramPosts.data.value && instagramPosts.data.value.data.length
  if (!hasPosts) {
    instagramPosts.clear()
    await scrapePosts.execute()
    await instagramPosts.execute()
    return
  }

  if (postAnalyses.status.value === 'pending')
    return

  const hasAnalyses = postAnalyses.data.value && postAnalyses.data.value.data.length
  if (!hasAnalyses) {
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
  <Header :id="active" :name="battle?.name" :status="battleStatus" />
  <div class="w-full flex flex-col">
    <Subtitle class="gap-0.5">
      <Icon v-if="page === 1 && hasNoPostAnalyses && (hasPostsLoading || hasPostAnalysesLoading)" name="svg-spinners:bars-scale-middle" />
      <Icon v-else name="lucide:lightbulb" />
      Análises
    </Subtitle>
    <Carousel class="relative w-full px-6 min-h-[176px]">
      <CarouselContent>
        <template v-if="!hasPostAnalysesLoading">
          <CarouselItem
            v-for="analysis in parsedPostAnalyses" :key="analysis.id"
            class="min-h-44 relative flex items-center"
          >
            <WarningOverlay :show="analysis.hasError" />
            <div v-if="!analysis.hasError" class="flex flex-col gap-2 select-none text-sm justify-between h-full">
              <p class="max-h-24 overflow-hidden text-ellipsis">
                O modelo
                <span class="text-yellow-400 font-bold">{{ LLM_INFO_MAP[analysis.model].name }}</span> da <span
                  class="text-yellow-400 font-bold"
                >{{ LLM_INFO_MAP[analysis.model].owner }}</span>
                analisou a imagem da
                <NuxtLink
                  :href="analysis.instagramHref" class="underline cursor-pointer font-bold text-blue-400"
                  target="_blank"
                >
                  postagem.
                </NuxtLink>
              </p>
              <p v-if="isFuture(parseISO(analysis?.dateString))">
                Segundo sua análise uma ocorrência do evento acontecerá no dia <span class="font-bold">{{
                  formatDateLong(parseISO(analysis?.dateString)) }}</span>
                no local <span class="font-bold">"{{ analysis.location }}"</span>.
              </p>
              <p v-else-if="isPast(parseISO(analysis?.dateString))">
                Segundo sua análise uma ocorrência do evento aconteceu no dia <span class="font-bold">{{
                  formatDateLong(parseISO(analysis?.dateString)) }}</span>
                no local <span class="font-bold">"{{ analysis.location }}"</span>.
              </p>
              <div class="flex justify-end">
                <Popover size="top" :hide-when-detached="true">
                  <Button as-child variant="ghost" size="icon" class="p-0.5 h-8 w-8 text-green-300">
                    <PopoverTrigger>
                      <Icon name="lucide:circle-dollar-sign" class="h-4 w-4" />
                    </PopoverTrigger>
                  </Button>
                  <PopoverContent class="p-1.5 px-3 w-auto max-w-xs text-sm">
                    Esta análise custou $ {{ analysis.totalCost?.toFixed(8) }}
                  </PopoverContent>
                </Popover>
                <Popover size="top" :hide-when-detached="true">
                  <Button as-child variant="ghost" size="icon" class="p-0.5 h-8 w-8 text-blue-300">
                    <PopoverTrigger>
                      <Icon name="lucide:clock" class="h-4 w-4" />
                    </PopoverTrigger>
                  </Button>
                  <PopoverContent class="p-1.5 px-3 w-auto text-sm">
                    Análise feita em {{ formatDateLong(analysis.createdAt) }}
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div v-else class="flex flex-col gap-2 select-none text-sm justify-between h-full">
              <p>
                O modelo
                <span class="text-yellow-400 font-bold">{{ LLM_INFO_MAP[analysis.model].name }}</span> da <span
                  class="text-yellow-400 font-bold"
                >{{ LLM_INFO_MAP[analysis.model].owner }}</span>
                analisou a imagem da
                <NuxtLink
                  :href="analysis.instagramHref" class="underline cursor-pointer font-bold text-blue-400"
                  target="_blank"
                >
                  postagem.
                </NuxtLink>
              </p>
              <p class="max-h-24 overflow-hidden text-ellipsis">
                A sua resposta foi: <span class="italic font-bold">"{{ analysis.rawContent }}"</span>
              </p>
              <div class="flex justify-end">
                <Popover size="top" :hide-when-detached="true">
                  <Button as-child variant="ghost" size="icon" class="p-0.5 h-8 w-8 text-green-300">
                    <PopoverTrigger>
                      <Icon name="lucide:circle-dollar-sign" class="h-4 w-4" />
                    </PopoverTrigger>
                  </Button>
                  <PopoverContent class="p-1.5 px-3 w-auto max-w-xs text-sm">
                    Esta análise custou $ {{ analysis.totalCost?.toFixed(8) }}
                  </PopoverContent>
                </Popover>
                <Popover size="top" :hide-when-detached="true">
                  <Button as-child variant="ghost" size="icon" class="p-0.5 h-8 w-8 text-blue-300">
                    <PopoverTrigger>
                      <Icon name="lucide:clock" class="h-4 w-4" />
                    </PopoverTrigger>
                  </Button>
                  <PopoverContent class="p-1.5 px-3 w-auto text-sm">
                    Análise feita em {{ formatDateLong(analysis.createdAt) }}
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CarouselItem>
        </template>
        <template v-if="page === 1 && hasNoPostAnalyses && (hasPostsLoading || hasPostAnalysesLoading)">
          <CarouselItem>
            <div class="flex flex-col gap-2 justify-between min-h-full">
              <Skeleton class="flex-grow-0 flex-shrink-1 w-full rounded-sm h-10" />
              <Skeleton class="flex-grow-0 flex-shrink-1 w-full rounded-sm h-20" />
              <div class="flex justify-end gap-2">
                <Skeleton class="h-6 w-6" />
                <Skeleton class="h-6 w-6" />
              </div>
            </div>
          </CarouselItem>
        </template>
        <CarouselItem v-else-if="hasPostAnalysesError" class="h-full w-full flex items-center">
          <TryAgain @refresh="postAnalyses.refresh">
            Erro ao buscar as análises. Por favor, tente novamente.
          </TryAgain>
        </CarouselItem>
        <CarouselItem v-else-if="hasNoPostAnalyses && !hasPostAnalysesLoading" class="h-full w-full flex justify-center items-center">
          <p class="text-sm select-none">
            Nenhuma análise encontrada.
          </p>
        </CarouselItem>
      </CarouselContent>
      <CarouselPrevious v-if="!hasNoPostAnalyses && !hasPostAnalysesError" class="-left-6 ml-2 h-full" />
      <CarouselNext v-if="!hasNoPostAnalyses && !hasPostAnalysesError" class="-right-6 mr-2 h-full" />
    </Carousel>

    <Divider />

    <Subtitle class="gap-1.5">
      <Icon v-if="hasPostsLoading" name="svg-spinners:bars-scale-middle" />
      <Icon v-else name="lucide:gallery-horizontal" />
      Postagens
    </Subtitle>
    <Carousel class="px-6" :opts="{ dragFree: false, watchSlides }" @scroll="handleScrollEnd">
      <CarouselContent>
        <CarouselItem v-for="post in storedPosts" :key="post.id" class="max-h-[300px] md:max-h-max">
          <NuxtLink draggable="false" class="w-full h-full rounded-md aspect-square" :href="post.href" target="blank">
            <NuxtImg v-if="false" />
            <img
              v-if="active" draggable="false"
              class="flex-1 aspect-square select-none object-cover object-top h-full w-full rounded-md overflow-hidden text-ellipsis flex flex-col items-center justify-center"
              :src="`/${post.rhymeBattleId}/${sanitizeId(post.id)}.jpeg`" :alt="post.alt ? post.alt : ''"
            >
          </NuxtLink>
        </CarouselItem>
        <template v-if="hasPostsLoading">
          <CarouselItem
            v-for="number in Array.from({ length: perPage }, (_, index) => index)" :key="number"
            class="max-h-[300px] md:max-h-max"
          >
            <Skeleton class="flex-grow-0 flex-shrink-1 h-full w-full aspect-square rounded-sm" />
          </CarouselItem>
        </template>
        <CarouselItem v-else-if="hasPostsError" class="h-full w-full flex items-center">
          <TryAgain @refresh="instagramPosts.refresh">
            Erro ao buscar as postagens. Por favor, tente novamente.
          </TryAgain>
        </CarouselItem>
        <CarouselItem v-else-if="hasNoPostsData" class="h-full w-full flex justify-center items-center">
          <p class="text-sm sm select-none">
            Nenhuma postagem encontrada.
          </p>
        </CarouselItem>
      </CarouselContent>
      <CarouselPrevious v-if="!hasNoPostsData && !hasPostsError" class="-left-6 ml-2 h-full" />
      <CarouselNext v-if="!hasNoPostsData && !hasPostsError" class="-right-6 mr-2 h-full" />
    </Carousel>
  </div>
</template>
