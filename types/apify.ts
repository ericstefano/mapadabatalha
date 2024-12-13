export interface ScrapedInstagramPost {
  inputUrl: string
  url: string
  type: string
  shortCode: string
  caption: string
  hashtags: string[]
  mentions: string[]
  commentsCount: number
  firstComment?: string
  latestComments: string[]
  dimensionsHeight: number
  dimensionsWidth: number
  displayUrl: string
  images: string[]
  alt: string
  likesCount: number
  timestamp: string
  childPosts: ScrapedInstagramPost[]
  ownerFullName: string
  ownerUsername: string
  ownerId: string
  isSponsored: boolean
}
