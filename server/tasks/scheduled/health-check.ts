export default defineTask({
  meta: {
    name: 'scheduled:health-check',
    description: 'Health Check',
  },
  async run() {
    await $fetch('/api/health-check')
    return { result: 'success' }
  },
})
