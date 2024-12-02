import type { StringMappingType } from 'typescript'

// https:// openrouter.ai/docs/requests
export interface TextContent {
  type: 'text'
  text: string
}

export interface ImageContentPart {
  type: 'image_url'
  image_url: {
    url: string
    detail?: string
  }
}

export type ContentPart = TextContent | ImageContentPart

export type Message =
  | {
    role: 'user' | 'assistant' | 'system'
    content: string | ContentPart[]
    name?: string
  }
  | {
    role: 'tool'
    content: string
    tool_call_id: string
    name?: string
  }

export interface FunctionDescription {
  description?: string
  name: string
  parameters: object
}

export interface Tool {
  type: 'function'
  function: FunctionDescription
}

export type ToolChoice =
  | 'none'
  | 'auto'
  | {
    type: 'function'
    function: {
      name: string
    }
  }

export interface Request {
  model: string
  messages: Message[]
  prompt?: string
  response_format?: { type: 'json_object' }
  stop?: string | string[]
  stream?: boolean
  max_tokens?: number
  temperature?: number
  top_p?: number
  top_k?: number
  frequency_penalty?: number
  presence_penalty?: number
  repetition_penalty?: number
  seed?: number
  tools?: Tool[]
  tool_choice?: ToolChoice
  logit_bias?: { [key: number]: number }
  prediction?: { type: 'content', content: string }
  transforms?: string[]
  models?: string[]
  route?: 'fallback'
  provider?: {
    order?: string[]
    allow_fallbacks: boolean
  }
}
//////////////////////////////////////////////////////////////////////
// https://openrouter.ai/docs/responses

export interface NonChatChoice {
  finish_reason: string | null
  text: string
  error?: Error
}

export interface NonStreamingChoice {
  finish_reason: string | null
  message: {
    content: string | null
    role: string
    tool_calls?: ToolCall[]
  }
  error?: Error
}

interface StreamingChoice {
  finish_reason: string | null
  delta: {
    content: string | null
    role?: string
    tool_calls?: ToolCall[]
  }
  error?: Error
}

interface Error {
  code: number
  message: string
}

interface FunctionCall {
  name: string
  arguments: string
}

interface ToolCall {
  id: string
  type: 'function'
  function: FunctionCall
}

export interface ResponseUsage {
  prompt_tokens: number
  completion_tokens: number
  total_tokens: number
}

export interface ChatCompletionsResponse {
  id: string
  provider: string
  choices: (NonStreamingChoice | StreamingChoice | NonChatChoice)[]
  created: number
  model: string
  object: 'chat.completion' | 'chat.completion.chunk'
  system_fingerprint?: string
  usage?: ResponseUsage
}

export interface GenerationResponse {
  data: {
    id: StringMappingType
    model: string
    generation_time: number
    tokens_prompt: number
    tokens_completion: number
    native_tokens_prompt: number
    native_tokens_completion: number
    latency: number
    created_at: string
    total_cost: number
  }
}

export interface Responses {
  '/chat/completions': ChatCompletionsResponse
  '/generation': GenerationResponse
}

export type Endpoints = keyof Responses
