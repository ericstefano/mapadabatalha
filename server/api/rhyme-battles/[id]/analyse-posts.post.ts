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
      columns: { id: true },
      orderBy: (battles, { desc }) => [desc(battles.timestamp)],
      where: (posts, { eq }) => (eq(posts.rhymeBattleId, parsed.output.id)),
      limit: 3,
      // where: (posts, { gt }) => (gt(posts.timestamp, subDays(new Date(), 15))),
    })

    await Promise.all(
      instagramPosts.map(post =>
        $fetch(`/api/instagram-posts/${post.id}/identify-post`, {
          method: 'POST',
        }),
      ),
    )

    const identifiedPostIds = await db.query.postIndentificationsTable.findMany({
      columns: { instagramPostId: true },
      orderBy: (identifications, { desc }) => [desc(identifications.createdAt)],
      where: (identifications, { eq, and }) => (and(eq(identifications.rhymeBattleId, parsed.output.id), eq(identifications.parsedContent, 'true'))),
      limit: 3,
    })

    await Promise.all(
      identifiedPostIds.map(identified =>
        $fetch(`/api/instagram-posts/${identified.instagramPostId}/analyse-post`, {
          method: 'POST',
        }),
      ),
    )
    return sendNoContent(event)
  },
)
