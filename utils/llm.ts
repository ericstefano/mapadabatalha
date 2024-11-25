import * as v from 'valibot'
import type { POST_ANALYSIS_ERRORS } from '~/constants/errors'

function keepOnlyFirstComma(text: string): string {
  const firstCommaIndex = text.indexOf(',')
  if (firstCommaIndex === -1) {
    return text
  }

  const firstPart = text.substring(0, firstCommaIndex + 1)
  const secondPart = text.substring(firstCommaIndex + 1).replace(/,/g, '')
  return firstPart + secondPart
}

const QUOTES_REGEX = /['"]/g

interface ParseAnalysisLineParams {
  raw: string | null | undefined
}
export function parseAnalysis({ raw }: ParseAnalysisLineParams) {
  const errors: Partial<Record<keyof typeof POST_ANALYSIS_ERRORS, true>> = {}
  const line = raw || ''
  const treatedLine = keepOnlyFirstComma(line).toLowerCase()
  const split = treatedLine.split(',')
  if (split.length !== 2) {
    errors.INVALID_LINE_FORMAT = true
    return { raw, result: 'null, null', errors }
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

  const result = `${dateTime},${location}`
  return { raw, result, errors }
}

function checkBooleanish(booleanish: string) {
  if (booleanish === 'true' || booleanish === 'false')
    return booleanish
  return null
}

interface ParseIdentifyLineParams {
  raw: string | null | undefined
}
export function parseIdentify({ raw }: ParseIdentifyLineParams) {
  const line = raw || ''
  const treatedLine = line.trim().toLowerCase()
  const result = checkBooleanish(treatedLine)
  return { raw, error: result === null, result }
}

export function hasMessage(obj: Record<string, any>): obj is NonStreamingChoice {
  return 'message' in obj
}
