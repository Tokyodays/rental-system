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
          store_id: string
          role_id: string
          created_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          store_id: string
          role_id: string
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          store_id?: string
          role_id?: string
          created_at?: string
        }
      }
      vehicles: {
        Row: {
          id: string
          name: string
          model_year: number | null
          license_plate: string | null
          status_id: string
          store_id: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          model_year?: number | null
          license_plate?: string | null
          status_id: string
          store_id: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          model_year?: number | null
          license_plate?: string | null
          status_id?: string
          store_id?: string
          created_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          full_name: string
          email: string | null
          phone_number: string | null
          store_id: string
          created_at: string
        }
        Insert: {
          id?: string
          full_name: string
          email?: string | null
          phone_number?: string | null
          store_id: string
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          email?: string | null
          phone_number?: string | null
          store_id?: string
          created_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          vehicle_id: string
          customer_id: string
          staff_id: string
          store_id: string
          start_date: string
          end_date: string | null
          price: number | null
          created_at: string
        }
        Insert: {
          id?: string
          vehicle_id: string
          customer_id: string
          staff_id: string
          store_id: string
          start_date?: string
          end_date?: string | null
          price?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          vehicle_id?: string
          customer_id?: string
          staff_id?: string
          store_id?: string
          start_date?: string
          end_date?: string | null
          price?: number | null
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
