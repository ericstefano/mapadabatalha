export default defineTask({
  meta: {
    name: 'scheduled:routine',
    description: 'Scrape, identify and analyse posts from the battle with least amount.',
  },
  async run() {
    return { result: 'success' }
    console.log('Running routine scrape, identify, analyse...')
    await $fetch('/api/scrape-identify-analyse')
    return { result: 'success' }
  },
})
