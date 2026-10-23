export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      currency: {
        Row: {
          currency_symbol: string
          currency_text: string
          id: number
        }
        Insert: {
          currency_symbol: string
          currency_text: string
          id?: never
        }
        Update: {
          currency_symbol?: string
          currency_text?: string
          id?: never
        }
        Relationships: []
      }
      customer_statuses: {
        Row: {
          color: string | null
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string
          id: string
          passport_number: string | null
          passport_url: string | null
          phone: string | null
          status_id: string | null
          store_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name: string
          id?: string
          passport_number?: string | null
          passport_url?: string | null
          phone?: string | null
          status_id?: string | null
          store_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string
          id?: string
          passport_number?: string | null
          passport_url?: string | null
          phone?: string | null
          status_id?: string | null
          store_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_status_id_fkey"
            columns: ["status_id"]
            isOneToOne: false
            referencedRelation: "customer_statuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customers_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      reservations: {
        Row: {
          created_at: string | null
          customer_id: string | null
          end_at: string
          id: string
          start_at: string
          status: string | null
          store_id: string | null
          vehicle_id: string | null
        }
        Insert: {
          created_at?: string | null
          customer_id?: string | null
          end_at: string
          id?: string
          start_at: string
          status?: string | null
          store_id?: string | null
          vehicle_id?: string | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string | null
          end_at?: string
          id?: string
          start_at?: string
          status?: string | null
          store_id?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reservations_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      staff: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          id: string
          locale: string | null
          role_id: string
          store_id: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          id: string
          locale?: string | null
          role_id: string
          store_id?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          locale?: string | null
          role_id?: string
          store_id?: string | null
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "staff_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_roles: {
        Row: {
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      stores: {
        Row: {
          address: string | null
          created_at: string | null
          currency_id: number | null
          default_locale: string | null
          id: string
          name: string
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          currency_id?: number | null
          default_locale?: string | null
          id?: string
          name: string
        }
        Update: {
          address?: string | null
          created_at?: string | null
          currency_id?: number | null
          default_locale?: string | null
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "stores_currency_id_fkey"
            columns: ["currency_id"]
            isOneToOne: false
            referencedRelation: "currency"
            referencedColumns: ["id"]
          },
        ]
      }
      transaction_extensions: {
        Row: {
          additional_price: number
          created_at: string
          id: string
          new_end_at: string
          note: string | null
          previous_end_at: string
          staff_id: string | null
          store_id: string
          transaction_id: string
        }
        Insert: {
          additional_price?: number
          created_at?: string
          id?: string
          new_end_at: string
          note?: string | null
          previous_end_at: string
          staff_id?: string | null
          store_id: string
          transaction_id: string
        }
        Update: {
          additional_price?: number
          created_at?: string
          id?: string
          new_end_at?: string
          note?: string | null
          previous_end_at?: string
          staff_id?: string | null
          store_id?: string
          transaction_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transaction_extensions_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transaction_extensions_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transaction_extensions_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          created_at: string | null
          customer_id: string | null
          deposit: string | null
          end_at: string | null
          end_mileage: number | null
          helmet_lent: boolean
          id: string
          key_handed_over: boolean
          price: number | null
          returned_at: string | null
          staff_id: string | null
          start_at: string | null
          start_mileage: number | null
          status: string | null
          store_id: string | null
          vehicle_id: string | null
        }
        Insert: {
          created_at?: string | null
          customer_id?: string | null
          deposit?: string | null
          end_at?: string | null
          end_mileage?: number | null
          helmet_lent?: boolean
          id?: string
          key_handed_over?: boolean
          price?: number | null
          returned_at?: string | null
          staff_id?: string | null
          start_at?: string | null
          start_mileage?: number | null
          status?: string | null
          store_id?: string | null
          vehicle_id?: string | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string | null
          deposit?: string | null
          end_at?: string | null
          end_mileage?: number | null
          helmet_lent?: boolean
          id?: string
          key_handed_over?: boolean
          price?: number | null
          returned_at?: string | null
          staff_id?: string | null
          start_at?: string | null
          start_mileage?: number | null
          status?: string | null
          store_id?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_store_map: {
        Row: {
          store_id: string
          user_id: string
        }
        Insert: {
          store_id: string
          user_id: string
        }
        Update: {
          store_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_store_map_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_categories: {
        Row: {
          created_at: string | null
          icon: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          icon?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          icon?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      vehicle_statuses: {
        Row: {
          color: string | null
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      vehicles: {
        Row: {
          category_id: string | null
          code: string
          created_at: string | null
          deleted_at: string | null
          id: string
          image_url: string | null
          image_urls: string[] | null
          last_mileage: number | null
          last_oil_change_on: string | null
          name: string
          status_id: string | null
          store_id: string
          updated_at: string | null
        }
        Insert: {
          category_id?: string | null
          code?: string
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          image_url?: string | null
          image_urls?: string[] | null
          last_mileage?: number | null
          last_oil_change_on?: string | null
          name: string
          status_id?: string | null
          store_id: string
          updated_at?: string | null
        }
        Update: {
          category_id?: string | null
          code?: string
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          image_url?: string | null
          image_urls?: string[] | null
          last_mileage?: number | null
          last_oil_change_on?: string | null
          name?: string
          status_id?: string | null
          store_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "vehicle_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicles_status_id_fkey"
            columns: ["status_id"]
            isOneToOne: false
            referencedRelation: "vehicle_statuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicles_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      complete_lending: {
        Args: {
          p_customer_id: string
          p_deposit?: string
          p_end_at: string
          p_helmet_lent?: boolean
          p_key_handed_over?: boolean
          p_price: number
          p_staff_id: string
          p_start_at: string
          p_start_mileage: number
          p_store_id: string
          p_vehicle_id: string
        }
        Returns: string
      }
      complete_return: {
        Args: {
          p_customer_id: string
          p_end_at: string
          p_transaction_id: string
          p_vehicle_id: string
        }
        Returns: undefined
      }
      extend_rental: {
        Args: {
          p_additional_price: number
          p_new_end_at: string
          p_note?: string
          p_transaction_id: string
        }
        Returns: string
      }
      generate_random_alphanumeric: {
        Args: { length: number }
        Returns: string
      }
      generate_unique_vehicle_code: { Args: never; Returns: string }
      get_auth_store_id: { Args: never; Returns: string }
      is_admin: { Args: never; Returns: boolean }
      is_super_admin: { Args: never; Returns: boolean }
      set_my_locale: { Args: { p_locale: string }; Returns: undefined }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
