import * as v from 'valibot'

const cookiesSchema = v.array(v.pipe(v.object({
  name: v.string(),
  value: v.string(),
  domain: v.optional(v.string(), '.www.instagram.com'),
  path: v.optional(v.string(), '/'),
  secure: v.optional(v.boolean(), true),
  sameSite: v.optional(v.picklist(['Lax', 'Strict', 'None'])),
}), v.transform((data) => {
  if (['ps_l', 'rur', 'wd'].includes(data.name)) {
    return {
      ...data,
      sameSite: 'Lax',
    }
  }
  return data
})))

export function parseCookieString(cookieString: string) {
  const cookies = []
  const cookieArray = cookieString.split(';')

  for (const cookie of cookieArray) {
    const [key, value] = cookie.split('=').map(part => part.trim())
    if (key) {
      cookies.push({
        name: key,
        value: value ? value.replace(/^"|"$/g, '') : '',
      })
    }
  }

  return cookies
}

export function useInstagramCookies() {
  const { instagramCookieString } = useRuntimeConfig()
  if (!instagramCookieString)
    throw new Error('Missing \'NUXT_INSTAGRAM_COOKIE_STRING\' in .env')
  const parsedCookies = v.safeParse(cookiesSchema, parseCookieString(instagramCookieString))
  if (!parsedCookies.success)
    throw new Error(`Invalid cookies. ${parsedCookies.issues.map(issue => issue.message).join(', ')}`)
  return parsedCookies.output
}
