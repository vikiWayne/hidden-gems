export interface Location {
  latitude: number
  longitude: number
  altitude?: number
}

export type MessageVisibility = 'public' | 'private'

export type MessageType = 'text' | 'voice' | 'image' | 'video'

export type MarkerColor =
  | 'purple'
  | 'orange'
  | 'green'
  | 'gold'
  | 'teal'
  | 'blue'
  | 'red'
  | 'pink'

export interface Message {
  id: string
  type?: MessageType
  content: string
  mediaUrl?: string
  location: Location
  visibility: MessageVisibility
  allowedUserIds?: string[]
  category?: string
  createdBy?: string
  createdAt: string
  distance?: number
  markerColor?: MarkerColor
}

export interface NearbyMessage extends Message {
  distance: number
  walkTime?: string
  isOwn?: boolean
}

export type ProximityState = 'far' | 'near' | 'unlocked'

/** Message created by current user, stored locally for My Tags */
export interface CreatedMessage {
  id: string
  type: MessageType
  content: string
  mediaUrl?: string
  title: string
  location: Location
  visibility: MessageVisibility
  allowedUserIds?: string[]
  category?: string
  createdAt: string
  markerColor?: MarkerColor
}
