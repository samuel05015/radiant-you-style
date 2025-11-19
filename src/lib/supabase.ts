import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase credentials not configured. Using local storage only.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

// Database Types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          email: string;
          name: string;
          gender: string | null;
          face_shape: string | null;
          skin_tone: string | null;
          photo_url: string | null;
          analysis_confidence: number | null;
          glow_days: number;
          check_ins: number;
          looks_created: number;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          email: string;
          name: string;
          gender?: string | null;
          face_shape?: string | null;
          skin_tone?: string | null;
          photo_url?: string | null;
          analysis_confidence?: number | null;
          glow_days?: number;
          check_ins?: number;
          looks_created?: number;
        };
        Update: {
          id?: string;
          updated_at?: string;
          email?: string;
          name?: string;
          gender?: string | null;
          face_shape?: string | null;
          skin_tone?: string | null;
          photo_url?: string | null;
          analysis_confidence?: number | null;
          glow_days?: number;
          check_ins?: number;
          looks_created?: number;
        };
      };
      skincare_routines: {
        Row: {
          id: string;
          profile_id: string;
          created_at: string;
          date: string;
          steps_completed: number;
          total_steps: number;
          notes: string | null;
        };
        Insert: {
          id?: string;
          profile_id: string;
          created_at?: string;
          date: string;
          steps_completed: number;
          total_steps: number;
          notes?: string | null;
        };
        Update: {
          id?: string;
          profile_id?: string;
          date?: string;
          steps_completed?: number;
          total_steps?: number;
          notes?: string | null;
        };
      };
      hair_check_ins: {
        Row: {
          id: string;
          profile_id: string;
          created_at: string;
          date: string;
          condition: string;
          recommendations: string[];
          styling_tips: string[];
        };
        Insert: {
          id?: string;
          profile_id: string;
          created_at?: string;
          date: string;
          condition: string;
          recommendations: string[];
          styling_tips: string[];
        };
        Update: {
          id?: string;
          profile_id?: string;
          date?: string;
          condition?: string;
          recommendations?: string[];
          styling_tips?: string[];
        };
      };
      outfits: {
        Row: {
          id: string;
          profile_id: string;
          created_at: string;
          occasion: string;
          top: string;
          bottom: string;
          shoes: string;
          accessories: string[];
          makeup: string;
          hair: string;
          reasoning: string;
          favorite: boolean;
        };
        Insert: {
          id?: string;
          profile_id: string;
          created_at?: string;
          occasion: string;
          top: string;
          bottom: string;
          shoes: string;
          accessories: string[];
          makeup: string;
          hair: string;
          reasoning: string;
          favorite?: boolean;
        };
        Update: {
          id?: string;
          profile_id?: string;
          occasion?: string;
          top?: string;
          bottom?: string;
          shoes?: string;
          accessories?: string[];
          makeup?: string;
          hair?: string;
          reasoning?: string;
          favorite?: boolean;
        };
      };
      closet_items: {
        Row: {
          id: string;
          profile_id: string;
          created_at: string;
          category: string;
          color: string;
          description: string;
          image_url: string | null;
        };
        Insert: {
          id?: string;
          profile_id: string;
          created_at?: string;
          category: string;
          color: string;
          description: string;
          image_url?: string | null;
        };
        Update: {
          id?: string;
          profile_id?: string;
          category?: string;
          color?: string;
          description?: string;
          image_url?: string | null;
        };
      };
    };
  };
}
