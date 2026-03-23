export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      analysis_history: {
        Row: {
          id: string
          user_id: string
          created_at: string
          skin_type: string | null
          score: number | null
          ai_observation: string | null
          goal_conflict: string | null
          questionnaire: Json | null
          image_url: string | null
        }
        Insert: {
          id?: string
          user_id: string
          created_at?: string
          skin_type?: string | null
          score?: number | null
          ai_observation?: string | null
          goal_conflict?: string | null
          questionnaire?: Json | null
          image_url?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          created_at?: string
          skin_type?: string | null
          score?: number | null
          ai_observation?: string | null
          goal_conflict?: string | null
          questionnaire?: Json | null
          image_url?: string | null
        }
      }
    }
  }
}
