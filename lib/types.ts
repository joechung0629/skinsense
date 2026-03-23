// Skin Analysis Types

export interface SkinAnalysisResult {
  id: string;
  skinType: "dry" | "oily" | "combination" | "normal" | "sensitive";
  concerns: string[];
  routine: SkincareRoutine;
  ingredients: IngredientRecommendation[];
  score: number;
  createdAt: string;
}

export interface SkincareRoutine {
  morning: RoutineStep[];
  evening: RoutineStep[];
}

export interface RoutineStep {
  order: number;
  product: string;
  purpose: string;
}

export interface IngredientRecommendation {
  ingredient: string;
  benefit: string;
  concentration?: string;
  avoid?: boolean;
}

export interface AnalyzeRequest {
  imageBase64?: string;
  imageUrl?: string;
  skinHistory?: string;
  concerns?: string[];
}

export interface AnalyzeResponse {
  success: boolean;
  data?: SkinAnalysisResult;
  error?: string;
}

// JSON-LD Schema Types
export interface WebSiteSchema {
  "@context": "https://schema.org";
  "@type": "WebSite";
  name: string;
  description: string;
  url: string;
  potentialAction: {
    "@type": "SearchAction";
    target: string;
    "query-input": string;
  };
}

export interface ProductSchema {
  "@context": "https://schema.org";
  "@type": "Product";
  name: string;
  description: string;
  brand: { "@type": "Brand"; name: string };
  aggregateRating?: {
    "@type": "AggregateRating";
    ratingValue: string;
    reviewCount: string;
  };
}

// Supabase Database Types (to be generated)
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["profiles"]["Row"], "created_at">;
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      analyses: {
        Row: {
          id: string;
          user_id: string;
          result: SkinAnalysisResult;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["analyses"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["analyses"]["Insert"]>;
      };
    };
  };
}
