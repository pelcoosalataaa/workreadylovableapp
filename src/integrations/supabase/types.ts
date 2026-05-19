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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      avdelningar: {
        Row: {
          farg: string | null
          foretag_id: string | null
          id: string
          namn: string
          skapad_at: string
        }
        Insert: {
          farg?: string | null
          foretag_id?: string | null
          id?: string
          namn: string
          skapad_at?: string
        }
        Update: {
          farg?: string | null
          foretag_id?: string | null
          id?: string
          namn?: string
          skapad_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "avdelningar_foretag_id_fkey"
            columns: ["foretag_id"]
            isOneToOne: false
            referencedRelation: "foretag"
            referencedColumns: ["id"]
          },
        ]
      }
      bemanningspartners: {
        Row: {
          epost: string | null
          foretag_id: string | null
          id: string
          namn: string
          ort: string | null
          skapad_at: string
          telefon: string | null
        }
        Insert: {
          epost?: string | null
          foretag_id?: string | null
          id?: string
          namn: string
          ort?: string | null
          skapad_at?: string
          telefon?: string | null
        }
        Update: {
          epost?: string | null
          foretag_id?: string | null
          id?: string
          namn?: string
          ort?: string | null
          skapad_at?: string
          telefon?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bemanningspartners_foretag_id_fkey"
            columns: ["foretag_id"]
            isOneToOne: false
            referencedRelation: "foretag"
            referencedColumns: ["id"]
          },
        ]
      }
      certifikat: {
        Row: {
          certifikattyp: string
          foretag_id: string | null
          id: string
          personal_id: string | null
          skapad_at: string
          status: string | null
          utfardat: string | null
          utgaar: string | null
        }
        Insert: {
          certifikattyp: string
          foretag_id?: string | null
          id?: string
          personal_id?: string | null
          skapad_at?: string
          status?: string | null
          utfardat?: string | null
          utgaar?: string | null
        }
        Update: {
          certifikattyp?: string
          foretag_id?: string | null
          id?: string
          personal_id?: string | null
          skapad_at?: string
          status?: string | null
          utfardat?: string | null
          utgaar?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "certifikat_foretag_id_fkey"
            columns: ["foretag_id"]
            isOneToOne: false
            referencedRelation: "foretag"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certifikat_personal_id_fkey"
            columns: ["personal_id"]
            isOneToOne: false
            referencedRelation: "personal"
            referencedColumns: ["id"]
          },
        ]
      }
      foretag: {
        Row: {
          adress: string | null
          bransch: string | null
          epost: string | null
          id: string
          namn: string
          organisationsnummer: string | null
          skapad_at: string
          telefon: string | null
        }
        Insert: {
          adress?: string | null
          bransch?: string | null
          epost?: string | null
          id?: string
          namn: string
          organisationsnummer?: string | null
          skapad_at?: string
          telefon?: string | null
        }
        Update: {
          adress?: string | null
          bransch?: string | null
          epost?: string | null
          id?: string
          namn?: string
          organisationsnummer?: string | null
          skapad_at?: string
          telefon?: string | null
        }
        Relationships: []
      }
      moduler: {
        Row: {
          created_at: string
          id: string
          kategori: string | null
          quiz: Json
          skapad_av: string | null
          steg: Json
          titel: string
          transkription: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          kategori?: string | null
          quiz?: Json
          skapad_av?: string | null
          steg?: Json
          titel: string
          transkription?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          kategori?: string | null
          quiz?: Json
          skapad_av?: string | null
          steg?: Json
          titel?: string
          transkription?: string | null
        }
        Relationships: []
      }
      personal: {
        Row: {
          anstallningstyp: string | null
          avdelning_id: string | null
          bemanningsbolag: string | null
          efternamn: string
          epost: string | null
          foretag_id: string | null
          fornamn: string
          framsteg: number
          id: string
          roll: string | null
          skapad_at: string
          startdatum: string | null
          status: string
          telefon: string | null
        }
        Insert: {
          anstallningstyp?: string | null
          avdelning_id?: string | null
          bemanningsbolag?: string | null
          efternamn: string
          epost?: string | null
          foretag_id?: string | null
          fornamn: string
          framsteg?: number
          id?: string
          roll?: string | null
          skapad_at?: string
          startdatum?: string | null
          status?: string
          telefon?: string | null
        }
        Update: {
          anstallningstyp?: string | null
          avdelning_id?: string | null
          bemanningsbolag?: string | null
          efternamn?: string
          epost?: string | null
          foretag_id?: string | null
          fornamn?: string
          framsteg?: number
          id?: string
          roll?: string | null
          skapad_at?: string
          startdatum?: string | null
          status?: string
          telefon?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "personal_avdelning_id_fkey"
            columns: ["avdelning_id"]
            isOneToOne: false
            referencedRelation: "avdelningar"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "personal_foretag_id_fkey"
            columns: ["foretag_id"]
            isOneToOne: false
            referencedRelation: "foretag"
            referencedColumns: ["id"]
          },
        ]
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
