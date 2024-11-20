export type GetInstagramPostsResponse = Awaited<ReturnType<typeof _getInstagramPosts>>
async function _getInstagramPosts() {
  return $fetch('/api/rhyme-battles/:id/instagram-posts', {
  })
}
