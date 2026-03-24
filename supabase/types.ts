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
      skincare_products: {
        Row: {
          id: string
          user_id: string
          name: string
          type: string
          brand: string | null
          notes: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          type: string
          brand?: string | null
          notes?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          type?: string
          brand?: string | null
          notes?: string | null
          created_at?: string | null
        }
      }
      product_usage_logs: {
        Row: {
          id: string
          user_id: string
          product_id: string
          used_at: string
          routine_time: string | null
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          used_at: string
          routine_time?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          used_at?: string
          routine_time?: string | null
        }
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
  }
}

// Skincare Product Types
export type ProductType = 'cleanser' | 'toner' | 'serum' | 'moisturizer' | 'sunscreen' | 'mask' | 'other';
export type RoutineTime = 'morning' | 'evening' | 'both';

export const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  cleanser: '潔面',
  toner: '爽膚水',
  serum: '精華',
  moisturizer: '面霜',
  sunscreen: '防曬',
  mask: '面膜',
  other: '其他',
};

export const ROUTINE_TIME_LABELS: Record<RoutineTime, string> = {
  morning: '早上',
  evening: '晚上',
  both: '早晚',
};
