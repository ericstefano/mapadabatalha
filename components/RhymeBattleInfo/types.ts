async function _getInstagramPosts() {
  return $fetch('/api/rhyme-battles/:id/instagram-posts', {
  })
}
// Hack to extract type from server endpoint.
// Find a better way.
export type GetInstagramPostsResponse = Awaited<ReturnType<typeof _getInstagramPosts>>
