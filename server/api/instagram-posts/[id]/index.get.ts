import * as v from 'valibot'
import { useDatabase } from '~/server/utils/useDatabase'

const instagramPostsRouterParams = v.object({
  id: v.string('id is required'),
})

function validateRouterParams(data: unknown) {
  return v.safeParse(instagramPostsRouterParams, data)
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
    const post = await db.query.instagramPostsTable.findFirst({
      where: (posts, { eq }) => (eq(posts.id, parsed.output.id)),
    })
    if (!post) {
      throw createError({
        status: 404,
        statusMessage: 'Not Found',
        message: `The instagram post id "${parsed.output.id}" was not found.`,
      })
    }
    return post
  },
)
