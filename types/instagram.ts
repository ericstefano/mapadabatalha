interface ImageMetadata {
  url: string
  height: number
  width: number
}

interface UserRelationship {
  following: boolean
  is_bestie: boolean
  is_feed_favorite: boolean
  is_restricted: boolean
}

interface ProfilePictureInfo {
  url: string
}

interface BaseUserInfo {
  pk: string
  username: string
  profile_pic_url: string
  is_verified: boolean
  full_name: string
}

interface InstagramUser extends BaseUserInfo {
  is_private: boolean
  is_embeds_disabled: boolean | null
  is_unpublished: boolean
  friendship_status: UserRelationship
  latest_besties_reel_media: number
  latest_reel_media: number
  live_broadcast_visibility: null
  live_broadcast_id: null
  seen: null
  supervision_info: null
  id: string
  hd_profile_pic_url_info: ProfilePictureInfo
  __typename: 'XDTUserDict'
}

interface PostOwner extends BaseUserInfo {
  friendship_status: UserRelationship
  is_embeds_disabled: boolean | null
  is_unpublished: boolean
  show_account_transparency_details: boolean
  supervision_info: null
  transparency_product: null
  transparency_product_enabled: boolean
  transparency_label: null
  id: string
  __typename: 'XDTUserDict'
  is_private: boolean
}

interface ContentCollaborator extends BaseUserInfo {
  is_unpublished: boolean | null
  id: string
  __typename: 'XDTUserDict'
  friendship_status: null
  supervision_info: null
}

interface PostLocation {
  pk: string
  lat: number
  lng: number
  name: string
  profile_pic_url: null
}

interface PostUserTag {
  user: BaseUserInfo
  position: [number, number]
}

interface PostCaption {
  has_translation: boolean
  created_at: number
  pk: string
  text: string
}

interface SharingSettings {
  bloks_app_url: null
  should_have_sharing_friction: boolean
}

interface PostImageVersions {
  candidates: ImageMetadata[]
}

interface InstagramPost {
  code: string
  pk: string
  id: string
  ad_id: null
  boosted_status: null
  boost_unavailable_identifier: null
  boost_unavailable_reason: null
  caption: PostCaption
  caption_is_edited: boolean
  taken_at: number
  image_versions2: PostImageVersions
  sharing_friction_info: SharingSettings
  is_paid_partnership: boolean
  original_height: number
  original_width: number
  user: InstagramUser
  owner: PostOwner
  coauthor_producers: ContentCollaborator[]
  invited_coauthor_producers: any[]
  location: PostLocation
  usertags: {
    in: PostUserTag[]
  }
  comment_count: number
  like_count: number
  has_liked: boolean
  product_type: string
  media_type: number
  accessibility_caption: string
  __typename: 'XDTMediaDict'
}

export interface PostEdge {
  node: InstagramPost
  cursor: string
}

interface PostFeedConnection {
  edges: PostEdge[]
}

interface SuggestedUserSocialInfo {
  pk: string
  username: string
  profile_pic_url: string
  id: string
}

interface BaseSuggestedUser {
  pk: string
  profile_pic_url: string
  full_name: string
  is_verified: boolean
  username: string
  is_private: boolean
  friendship_status: null
  supervision_info: null
  id: string
}

interface UserSuggestion {
  user: BaseSuggestedUser
  followed_by: boolean
  social_context: string
  social_context_facepile_users: SuggestedUserSocialInfo[] | null
  __typename: 'XDTSuggestedUserTypedDict'
}

interface UserSuggestionGroup {
  id: string
  type: number
  tracking_token: string
  suggestions: UserSuggestion[]
}

interface TimelineFeedItem {
  media: null
  ad: null
  explore_story: null
  end_of_feed_demarcator: null
  stories_netego: null
  suggested_users: UserSuggestionGroup
  bloks_netego: null
  __typename: 'XDTFeedItem'
}

interface TimelineFeedEdge {
  node: TimelineFeedItem
  cursor: string
}

interface TimelineFeedConnection {
  edges: TimelineFeedEdge[]
}

export interface UserTimelineResponse {
  data: {
    xdt_api__v1__feed__user_timeline_graphql_connection: PostFeedConnection
  }
}

export interface MainTimelineResponse {
  data: {
    xdt_api__v1__feed__timeline__connection: TimelineFeedConnection
  }
}
