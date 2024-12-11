import type Buffer from 'node:buffer'
import * as v from 'valibot'
import { bufferToBase64 } from '~/utils/file'

const imageRouterParams = v.object({
  path: v.string('path is required'),
})

function validateRouterParams(data: unknown) {
  return v.safeParse(imageRouterParams, data)
}

const imageQueryParams = v.object({
  extension: v.string('extension is required'),
})

function validateQueryParams(data: unknown) {
  return v.safeParse(imageQueryParams, data)
}

export default defineEventHandler(async (event) => {
  const parsedRouterParams = await getValidatedRouterParams(event, validateRouterParams)
  if (!parsedRouterParams.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: parsedRouterParams.issues.map(issue => issue.message).join(', '),
    })
  }
  const parsedQueryParams = await getValidatedQuery(event, validateQueryParams)
  if (!parsedQueryParams.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: parsedQueryParams.issues.map(issue => issue.message).join(', '),
    })
  }
  const storage = useStorage('images')
  const raw = await storage.getItemRaw<Buffer>(parsedRouterParams.output.path + parsedQueryParams.output.extension)
  if (!raw) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Not Found',
      message: `File path ${parsedRouterParams.output.path} not found.`,
    })
  }
  setResponseHeader(event, 'Content-Type', 'application/json')
  const base64 = bufferToBase64(raw)
  return {
    base64,
  }
})
