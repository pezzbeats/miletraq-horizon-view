export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      budget: {
        Row: {
          actual_amount: number | null
          budgeted_amount: number
          category: string
          created_at: string | null
          created_by: string
          id: string
          month: number
          updated_at: string | null
          year: number
        }
        Insert: {
          actual_amount?: number | null
          budgeted_amount: number
          category: string
          created_at?: string | null
          created_by: string
          id?: string
          month: number
          updated_at?: string | null
          year: number
        }
        Update: {
          actual_amount?: number | null
          budgeted_amount?: number
          category?: string
          created_at?: string | null
          created_by?: string
          id?: string
          month?: number
          updated_at?: string | null
          year?: number
        }
        Relationships: []
      }
      drivers: {
        Row: {
          address: string | null
          created_at: string | null
          created_by: string
          id: string
          is_active: boolean | null
          license_expiry: string | null
          license_number: string | null
          name: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          created_by: string
          id?: string
          is_active?: boolean | null
          license_expiry?: string | null
          license_number?: string | null
          name: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          created_by?: string
          id?: string
          is_active?: boolean | null
          license_expiry?: string | null
          license_number?: string | null
          name?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      fuel_log: {
        Row: {
          created_at: string | null
          created_by: string
          date: string
          driver_id: string | null
          fuel_source: string
          fuel_volume: number
          id: string
          km_driven: number | null
          mileage: number | null
          odometer_reading: number
          previous_reading: number | null
          rate_per_liter: number | null
          total_cost: number | null
          updated_at: string | null
          vehicle_id: string
          vendor_id: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          date: string
          driver_id?: string | null
          fuel_source: string
          fuel_volume: number
          id?: string
          km_driven?: number | null
          mileage?: number | null
          odometer_reading: number
          previous_reading?: number | null
          rate_per_liter?: number | null
          total_cost?: number | null
          updated_at?: string | null
          vehicle_id: string
          vendor_id?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          date?: string
          driver_id?: string | null
          fuel_source?: string
          fuel_volume?: number
          id?: string
          km_driven?: number | null
          mileage?: number | null
          odometer_reading?: number
          previous_reading?: number | null
          rate_per_liter?: number | null
          total_cost?: number | null
          updated_at?: string | null
          vehicle_id?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fuel_log_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fuel_log_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fuel_log_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      fuel_purchases: {
        Row: {
          created_at: string | null
          created_by: string
          id: string
          invoice_number: string | null
          purchase_date: string
          rate_per_liter: number
          total_cost: number
          updated_at: string | null
          vendor_id: string | null
          volume: number
        }
        Insert: {
          created_at?: string | null
          created_by: string
          id?: string
          invoice_number?: string | null
          purchase_date: string
          rate_per_liter: number
          total_cost: number
          updated_at?: string | null
          vendor_id?: string | null
          volume: number
        }
        Update: {
          created_at?: string | null
          created_by?: string
          id?: string
          invoice_number?: string | null
          purchase_date?: string
          rate_per_liter?: number
          total_cost?: number
          updated_at?: string | null
          vendor_id?: string | null
          volume?: number
        }
        Relationships: [
          {
            foreignKeyName: "fuel_purchases_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      fuel_tank: {
        Row: {
          capacity: number
          current_level: number
          id: string
          last_updated: string | null
          low_level_threshold: number | null
          updated_by: string
        }
        Insert: {
          capacity?: number
          current_level?: number
          id?: string
          last_updated?: string | null
          low_level_threshold?: number | null
          updated_by: string
        }
        Update: {
          capacity?: number
          current_level?: number
          id?: string
          last_updated?: string | null
          low_level_threshold?: number | null
          updated_by?: string
        }
        Relationships: []
      }
      maintenance_categories: {
        Row: {
          created_at: string | null
          created_by: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      maintenance_log: {
        Row: {
          category_id: string | null
          created_at: string | null
          created_by: string
          description: string
          gst_rate: number | null
          gst_type: string | null
          id: string
          is_gst_invoice: boolean | null
          labor_base_amount: number | null
          labor_cost: number | null
          labor_gst_amount: number | null
          maintenance_date: string
          maintenance_type: Database["public"]["Enums"]["maintenance_type"]
          next_service_date: string | null
          next_service_km: number | null
          odometer_reading: number | null
          photo_url: string | null
          total_cost: number
          updated_at: string | null
          vehicle_id: string
          vendor_id: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          created_by: string
          description: string
          gst_rate?: number | null
          gst_type?: string | null
          id?: string
          is_gst_invoice?: boolean | null
          labor_base_amount?: number | null
          labor_cost?: number | null
          labor_gst_amount?: number | null
          maintenance_date: string
          maintenance_type: Database["public"]["Enums"]["maintenance_type"]
          next_service_date?: string | null
          next_service_km?: number | null
          odometer_reading?: number | null
          photo_url?: string | null
          total_cost: number
          updated_at?: string | null
          vehicle_id: string
          vendor_id?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          created_by?: string
          description?: string
          gst_rate?: number | null
          gst_type?: string | null
          id?: string
          is_gst_invoice?: boolean | null
          labor_base_amount?: number | null
          labor_cost?: number | null
          labor_gst_amount?: number | null
          maintenance_date?: string
          maintenance_type?: Database["public"]["Enums"]["maintenance_type"]
          next_service_date?: string | null
          next_service_km?: number | null
          odometer_reading?: number | null
          photo_url?: string | null
          total_cost?: number
          updated_at?: string | null
          vehicle_id?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_log_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "maintenance_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_log_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_log_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_parts_used: {
        Row: {
          base_cost: number | null
          gst_amount: number | null
          gst_rate: number | null
          id: string
          is_gst_applicable: boolean | null
          maintenance_id: string
          part_id: string
          quantity: number
          total_cost: number
          unit_cost: number
        }
        Insert: {
          base_cost?: number | null
          gst_amount?: number | null
          gst_rate?: number | null
          id?: string
          is_gst_applicable?: boolean | null
          maintenance_id: string
          part_id: string
          quantity?: number
          total_cost: number
          unit_cost: number
        }
        Update: {
          base_cost?: number | null
          gst_amount?: number | null
          gst_rate?: number | null
          id?: string
          is_gst_applicable?: boolean | null
          maintenance_id?: string
          part_id?: string
          quantity?: number
          total_cost?: number
          unit_cost?: number
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_parts_used_maintenance_id_fkey"
            columns: ["maintenance_id"]
            isOneToOne: false
            referencedRelation: "maintenance_log"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_parts_used_part_id_fkey"
            columns: ["part_id"]
            isOneToOne: false
            referencedRelation: "parts_master"
            referencedColumns: ["id"]
          },
        ]
      }
      odometer_readings: {
        Row: {
          created_at: string | null
          created_by: string
          id: string
          notes: string | null
          odometer_reading: number
          reading_date: string
          updated_at: string | null
          vehicle_id: string
        }
        Insert: {
          created_at?: string | null
          created_by: string
          id?: string
          notes?: string | null
          odometer_reading: number
          reading_date: string
          updated_at?: string | null
          vehicle_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string
          id?: string
          notes?: string | null
          odometer_reading?: number
          reading_date?: string
          updated_at?: string | null
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "odometer_readings_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      parts_master: {
        Row: {
          category_id: string | null
          created_at: string | null
          created_by: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          part_number: string | null
          updated_at: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          created_by: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          part_number?: string | null
          updated_at?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          created_by?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          part_number?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "parts_master_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "maintenance_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string
          id: string
          is_active: boolean | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name: string
          id?: string
          is_active?: boolean | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      vehicle_documents: {
        Row: {
          alert_days_before: number | null
          created_at: string | null
          created_by: string
          document_name: string
          document_number: string | null
          document_type: Database["public"]["Enums"]["document_type"]
          document_url: string | null
          expiry_date: string | null
          id: string
          issue_date: string | null
          issuing_authority: string | null
          remarks: string | null
          status: string | null
          updated_at: string | null
          vehicle_id: string
        }
        Insert: {
          alert_days_before?: number | null
          created_at?: string | null
          created_by: string
          document_name: string
          document_number?: string | null
          document_type: Database["public"]["Enums"]["document_type"]
          document_url?: string | null
          expiry_date?: string | null
          id?: string
          issue_date?: string | null
          issuing_authority?: string | null
          remarks?: string | null
          status?: string | null
          updated_at?: string | null
          vehicle_id: string
        }
        Update: {
          alert_days_before?: number | null
          created_at?: string | null
          created_by?: string
          document_name?: string
          document_number?: string | null
          document_type?: Database["public"]["Enums"]["document_type"]
          document_url?: string | null
          expiry_date?: string | null
          id?: string
          issue_date?: string | null
          issuing_authority?: string | null
          remarks?: string | null
          status?: string | null
          updated_at?: string | null
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_documents_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          created_at: string | null
          created_by: string
          default_driver_id: string | null
          fuel_type: Database["public"]["Enums"]["fuel_type"]
          id: string
          insurance_expiry: string | null
          make: string
          model: string
          permit_expiry: string | null
          puc_expiry: string | null
          purchase_date: string | null
          rc_expiry: string | null
          status: Database["public"]["Enums"]["vehicle_status"] | null
          tank_capacity: number | null
          updated_at: string | null
          vehicle_number: string
          year: number | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          default_driver_id?: string | null
          fuel_type: Database["public"]["Enums"]["fuel_type"]
          id?: string
          insurance_expiry?: string | null
          make: string
          model: string
          permit_expiry?: string | null
          puc_expiry?: string | null
          purchase_date?: string | null
          rc_expiry?: string | null
          status?: Database["public"]["Enums"]["vehicle_status"] | null
          tank_capacity?: number | null
          updated_at?: string | null
          vehicle_number: string
          year?: number | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          default_driver_id?: string | null
          fuel_type?: Database["public"]["Enums"]["fuel_type"]
          id?: string
          insurance_expiry?: string | null
          make?: string
          model?: string
          permit_expiry?: string | null
          puc_expiry?: string | null
          purchase_date?: string | null
          rc_expiry?: string | null
          status?: Database["public"]["Enums"]["vehicle_status"] | null
          tank_capacity?: number | null
          updated_at?: string | null
          vehicle_number?: string
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_vehicles_default_driver"
            columns: ["default_driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
        ]
      }
      vendors: {
        Row: {
          address: string | null
          contact_person: string | null
          created_at: string | null
          created_by: string
          default_gst_rate: number | null
          email: string | null
          gst_number: string | null
          gst_registered: boolean | null
          id: string
          is_active: boolean | null
          name: string
          phone: string | null
          updated_at: string | null
          vendor_type: string[] | null
        }
        Insert: {
          address?: string | null
          contact_person?: string | null
          created_at?: string | null
          created_by: string
          default_gst_rate?: number | null
          email?: string | null
          gst_number?: string | null
          gst_registered?: boolean | null
          id?: string
          is_active?: boolean | null
          name: string
          phone?: string | null
          updated_at?: string | null
          vendor_type?: string[] | null
        }
        Update: {
          address?: string | null
          contact_person?: string | null
          created_at?: string | null
          created_by?: string
          default_gst_rate?: number | null
          email?: string | null
          gst_number?: string | null
          gst_registered?: boolean | null
          id?: string
          is_active?: boolean | null
          name?: string
          phone?: string | null
          updated_at?: string | null
          vendor_type?: string[] | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_document_status: {
        Args: { expiry_date: string }
        Returns: string
      }
    }
    Enums: {
      document_type: "rc" | "insurance" | "permit" | "puc" | "license" | "other"
      fuel_type: "petrol" | "diesel" | "cng" | "electric"
      maintenance_type: "breakdown" | "preventive" | "scheduled"
      user_role: "admin" | "manager" | "fuel_manager" | "viewer"
      vehicle_status: "active" | "inactive" | "maintenance" | "sold"
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
    Enums: {
      document_type: ["rc", "insurance", "permit", "puc", "license", "other"],
      fuel_type: ["petrol", "diesel", "cng", "electric"],
      maintenance_type: ["breakdown", "preventive", "scheduled"],
      user_role: ["admin", "manager", "fuel_manager", "viewer"],
      vehicle_status: ["active", "inactive", "maintenance", "sold"],
    },
  },
} as const
