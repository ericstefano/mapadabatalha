export const APP_NAME = 'Mapa da Batalha'
export const APP_DESCRIPTION = 'Mapa Interativo para visualização de Batalhas de Rima'
export const INSTAGRAM_BASE_URL = 'https://www.instagram.com'
export const OPEN_ROUTER_BASE_URL = 'https://openrouter.ai/api/v1'
export const MAPTILER_BASE_URL = 'https://api.maptiler.com/maps/streets-v2/'
export const MAX_ZOOM = 17.5
export const HORIZON_PITCH = 85
export const LLM_INFO_MAP: Record<string, {
  name: string
  owner: string
}> = {
  'meta-llama/llama-3.2-90b-vision-instruct': {
    name: 'Llama-3.2-90B-Vision-Instruct',
    owner: 'Meta',
  },
}
