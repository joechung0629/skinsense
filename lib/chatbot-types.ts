import { Database } from "@/supabase/types";

export type UserProfile = Database["public"]["Tables"]["user_profiles"]["Row"];

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export interface WeatherData {
  uvIndex: number;
  humidity: number;
  temperature: number;
  weatherCode: number;
  location: string;
}

export interface UserAllergen {
  id: string;
  user_id: string;
  allergen: string;
  created_at: string;
}
