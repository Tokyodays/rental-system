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
      [_ in string]: {
        Row: {
          [_ in string]: Json
        }
        Insert: {
          [_ in string]: Json
        }
        Update: {
          [_ in string]: Json
        }
      }
    }
    Views: {
      [_ in string]: {
        Row: {
          [_ in string]: Json
        }
      }
    }
    Functions: {
      [_ in string]: {
        Args: {
          [_ in string]: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in string]: string
    }
    CompositeTypes: {
      [_ in string]: {
        [key: string]: Json
      }
    }
  }
}
