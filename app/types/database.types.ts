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
      stores: {
        Row: {
          id: string
          name: string | null
          address: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name?: string | null
          address?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string | null
          address?: string | null
          created_at?: string
        }
      }
      staff_roles: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
        }
      }
      staff: {
        Row: {
          id: string
          full_name: string | null
          store_id: string | null
          role_id: string
          created_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          store_id?: string | null
          role_id: string
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          store_id?: string | null
          role_id?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
