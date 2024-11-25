import { isBefore, parseISO } from 'date-fns'
import * as v from 'valibot'
import type { POST_ANALYSIS_ERRORS } from '~/constants/errors'

const QUOTES_REGEX = /['"]/g

interface ParseLineParams {
  rawLine?: string | null
  postDate: Date
}
export function parseLine({ rawLine, postDate }: ParseLineParams) {
  const errors: Partial<Record<keyof typeof POST_ANALYSIS_ERRORS, true>> = {}
  const line = rawLine || ''
  const split = line.split(',')
  if (split.length !== 2) {
    errors.INVALID_LINE_FORMAT = true
    return { rawLine, result: 'null, null', errors }
  }
  const rawDateTime = split[0].trim().replace(QUOTES_REGEX, '')
  const rawLocation = split[1].trim().replace(QUOTES_REGEX, '')
  let dateTime: string | null = rawDateTime
  let location: string | null = rawLocation

  if (rawDateTime === 'null' || rawDateTime === 'undefined') {
    dateTime = null
    errors.NULL_DATETIME = true
  }

  if (rawLocation === 'null' || rawLocation === 'undefined') {
    location = null
    errors.NULL_LOCATION = true
  }

  const dateTimeIsValid = typeof dateTime === 'string' && Boolean(dateTime.match(v.ISO_DATE_TIME_REGEX))

  if (dateTime && !dateTimeIsValid) {
    errors.INVALID_DATETIME = true
  }

  if (dateTimeIsValid && isBefore(parseISO(dateTime!), postDate)) {
    errors.PAST_DATETIME = true
  }

  const result = `${dateTime},${location}`
  return { rawLine, result, errors }
}

export function hasMessage(obj: Record<string, any>): obj is NonStreamingChoice {
  return 'message' in obj
}
