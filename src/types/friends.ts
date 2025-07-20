export interface Friend {
  friend_id: string
  display_name: string
  email: string
  expert_subject?: string
  photo_url?: string
  created_at: string
}

export interface FriendRequest {
  request_id: string
  sender_id: string
  receiver_id: string
  status: string
  message?: string
  created_at: string
  sender_display_name: string
  sender_email: string
  sender_expert_subject?: string
  sender_photo_url?: string
}

export interface SentFriendRequest {
  request_id: string
  sender_id: string
  receiver_id: string
  status: string
  message?: string
  created_at: string
  receiver_display_name: string
  receiver_email: string
  receiver_expert_subject?: string
  receiver_photo_url?: string
} 