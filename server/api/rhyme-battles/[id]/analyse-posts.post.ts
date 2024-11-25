import * as v from 'valibot'

const analysePostsRouterParams = v.object({
  id: v.string('id is required'),
})

function validateRouterParams(data: unknown) {
  return v.safeParse(analysePostsRouterParams, data)
}
export default defineEventHandler(
  async (event) => {
    const parsed = await getValidatedRouterParams(event, validateRouterParams)
    if (!parsed.success) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        message: parsed.issues.map(issue => issue.message).join(', '),
      })
    }
    const db = await useDatabase(event)
    const battle = await db.query.rhymeBattlesTable.findFirst({
      where: (battles, { eq }) => (eq(battles.id, parsed.output.id)),
    })
    if (!battle) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Not Found',
        message: `The rhyme battle id "${parsed.output.id}" was not found.`,
      })
    }

    const instagramPosts = await db.query.instagramPostsTable.findMany({
      columns: { id: true, timestamp: true, description: true, alt: true, href: true, rhymeBattleId: true },
      orderBy: (battles, { desc }) => [desc(battles.timestamp)],
      where: (posts, { eq }) => (eq(posts.rhymeBattleId, parsed.output.id)),
      // where: (posts, { gt }) => (gt(posts.timestamp, subDays(new Date(), 15))),
      limit: 3,
    })

    // Talvez seja seguro remover essa verificação
    if (!instagramPosts.length) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Not Found',
        message: `The rhyme battle id "${parsed.output.id}" has no recent Instagram posts to be analyzed.`,
      })
    }

    await Promise.all(
      instagramPosts.map(post =>
        $fetch(`/api/instagram-posts/${post.id}/analyse-post`, {
          method: 'POST',
        }),
      ),
    )
    return sendNoContent(event)
  },
)
