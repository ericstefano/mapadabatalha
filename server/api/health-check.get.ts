let count = 0
export default defineEventHandler(async () => {
  return {
    checkCount: count++,
    status: 'ok',
  }
})
