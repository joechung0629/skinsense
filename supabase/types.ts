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
          created_at: string | null
          skin_type: string | null
          ai_observation: string | null
          goal_conflict: string | null
          concerns: Json | null
          routine: Json | null
          ingredients: Json | null
          questionnaire: Json | null
        }
        Insert: {
          id?: string
          user_id: string
          created_at?: string | null
          skin_type?: string | null
          ai_observation?: string | null
          goal_conflict?: string | null
          concerns?: Json | null
          routine?: Json | null
          ingredients?: Json | null
          questionnaire?: Json | null
        }
        Update: {
          id?: string
          user_id?: string
          created_at?: string | null
          skin_type?: string | null
          ai_observation?: string | null
          goal_conflict?: string | null
          concerns?: Json | null
          routine?: Json | null
          ingredients?: Json | null
          questionnaire?: Json | null
        }
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
  }
}
