import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      medications: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          dosage: string | null;
          notes: string | null;
          days: number[];
          times: string[];
          taken: Record<string, boolean>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          dosage?: string | null;
          notes?: string | null;
          days: number[];
          times: string[];
          taken?: Record<string, boolean>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          dosage?: string | null;
          notes?: string | null;
          days?: number[];
          times?: string[];
          taken?: Record<string, boolean>;
          created_at?: string;
          updated_at?: string;
        };
      };
      prescriptions: {
        Row: {
          id: string;
          user_id: string;
          image_url: string;
          extracted_text: string | null;
          medications_identified: any[] | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          image_url: string;
          extracted_text?: string | null;
          medications_identified?: any[] | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          image_url?: string;
          extracted_text?: string | null;
          medications_identified?: any[] | null;
          created_at?: string;
        };
      };
    };
  };
};