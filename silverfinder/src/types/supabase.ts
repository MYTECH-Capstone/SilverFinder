
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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      elders: {
        Row: {
          age: number | null
          caretaker_id: string | null
          created_at: string | null
          first_name: string | null
          id: string
          last_name: string | null
          medical_notes: string | null
          photo_url: string | null
        }
        Insert: {
          age?: number | null
          caretaker_id?: string | null
          created_at?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          medical_notes?: string | null
          photo_url?: string | null
        }
        Update: {
          age?: number | null
          caretaker_id?: string | null
          created_at?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          medical_notes?: string | null
          photo_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "elders_caretaker_id_fkey"
            columns: ["caretaker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      group_members: {
        Row: {
          group_id: string
          joined_at: string | null
          role: string | null
          user_id: string
          user_role: string | null
        }
        Insert: {
          group_id: string
          joined_at?: string | null
          role?: string | null
          user_id: string
          user_role?: string | null
        }
        Update: {
          group_id?: string
          joined_at?: string | null
          role?: string | null
          user_id?: string
          user_role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "home_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      home_groups: {
        Row: {
          created_at: string | null
          created_by: string | null
          group_name: string
          id: string
          join_code: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          group_name: string
          id?: string
          join_code: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          group_name?: string
          id?: string
          join_code?: string
        }
        Relationships: []
      }
      locations: {
        Row: {
          group_id: string | null
          id: string
          latitude: number
          longitude: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          group_id?: string | null
          id?: string
          latitude: number
          longitude: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          group_id?: string | null
          id?: string
          latitude?: number
          longitude?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "locations_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "home_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      missing_reports: {
        Row: {
          created_at: string | null
          elder_id: string | null
          id: string
          last_seen_date: string | null
          last_seen_location: string | null
          notes: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          elder_id?: string | null
          id?: string
          last_seen_date?: string | null
          last_seen_location?: string | null
          notes?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          elder_id?: string | null
          id?: string
          last_seen_date?: string | null
          last_seen_location?: string | null
          notes?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "missing_reports_elder_id_fkey"
            columns: ["elder_id"]
            isOneToOne: false
            referencedRelation: "elders"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          age: number | null
          allergies: string | null
          avatar_url: string | null
          blood_type: string | null
          conditions: string | null
          devices: string | null
          dis_marks: string | null
          email: string | null
          email_interval: number | null
          eye_color: string | null
          full_name: string | null
          gender: string | null
          hair_color: string | null
          height: string | null
          id: string
          last_email_sent_at: string | null
          medications: string | null
          physician: string | null
          plate_number: string | null
          race: string | null
          role: string | null
          updated_at: string | null
          username: string | null
          vehicle_descr: string | null
          weight: string | null
        }
        Insert: {
          age?: number | null
          allergies?: string | null
          avatar_url?: string | null
          blood_type?: string | null
          conditions?: string | null
          devices?: string | null
          dis_marks?: string | null
          email?: string | null
          email_interval?: number | null
          eye_color?: string | null
          full_name?: string | null
          gender?: string | null
          hair_color?: string | null
          height?: string | null
          id: string
          last_email_sent_at?: string | null
          medications?: string | null
          physician?: string | null
          plate_number?: string | null
          race?: string | null
          role?: string | null
          updated_at?: string | null
          username?: string | null
          vehicle_descr?: string | null
          weight?: string | null
        }
        Update: {
          age?: number | null
          allergies?: string | null
          avatar_url?: string | null
          blood_type?: string | null
          conditions?: string | null
          devices?: string | null
          dis_marks?: string | null
          email?: string | null
          email_interval?: number | null
          eye_color?: string | null
          full_name?: string | null
          gender?: string | null
          hair_color?: string | null
          height?: string | null
          id?: string
          last_email_sent_at?: string | null
          medications?: string | null
          physician?: string | null
          plate_number?: string | null
          race?: string | null
          role?: string | null
          updated_at?: string | null
          username?: string | null
          vehicle_descr?: string | null
          weight?: string | null
        }
        Relationships: []
      }
      timeline_event_audit: {
        Row: {
          action: string
          actor_user_id: string | null
          created_at: string
          group_id: string
          id: string
          new_data: Json | null
          old_data: Json | null
          timeline_event_id: string | null
        }
        Insert: {
          action: string
          actor_user_id?: string | null
          created_at?: string
          group_id: string
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          timeline_event_id?: string | null
        }
        Update: {
          action?: string
          actor_user_id?: string | null
          created_at?: string
          group_id?: string
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          timeline_event_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "timeline_event_audit_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "home_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timeline_event_audit_timeline_event_id_fkey"
            columns: ["timeline_event_id"]
            isOneToOne: false
            referencedRelation: "timeline_events"
            referencedColumns: ["id"]
          },
        ]
      }
      timeline_events: {
        Row: {
          created_at: string
          details: string | null
          group_id: string
          id: string
          label: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          details?: string | null
          group_id: string
          id?: string
          label: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          details?: string | null
          group_id?: string
          id?: string
          label?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "timeline_events_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "home_groups"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_group_ids: {
        Args: { uid: string }
        Returns: {
          group_id: string
        }[]
      }
      is_group_member: { Args: { group_id_in: string }; Returns: boolean }
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
