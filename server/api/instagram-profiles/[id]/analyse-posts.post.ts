import * as v from 'valibot'
import { useDatabase } from '~/server/utils/useDatabase'

const identifyPostsRouterParams = v.object({
  id: v.string('id is required'),
})

function validateRouterParams(data: unknown) {
  return v.safeParse(identifyPostsRouterParams, data)
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
    const profile = await db.query.instagramProfilesTable.findFirst({
      where: (profiles, { eq }) => (eq(profiles.id, parsed.output.id)),
    })
    if (!profile) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Not Found',
        message: `The instagram profile id "${parsed.output.id}" was not found.`,
      })
    }

    const instagramPosts = await db.query.instagramPostsTable.findMany({
      columns: { id: true },
      orderBy: (battles, { desc }) => [desc(battles.timestamp)],
      where: (posts, { eq }) => (eq(posts.instagramProfileId, parsed.output.id)),
    })

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
