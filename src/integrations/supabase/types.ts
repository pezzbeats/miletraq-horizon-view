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
      app_settings: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          id: string
          is_system: boolean | null
          setting_key: string
          setting_value: Json
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_system?: boolean | null
          setting_key: string
          setting_value: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_system?: boolean | null
          setting_key?: string
          setting_value?: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "app_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      budget: {
        Row: {
          actual_amount: number | null
          budgeted_amount: number
          category: string
          created_at: string | null
          created_by: string
          description: string | null
          id: string
          period_end: string
          period_start: string
          remaining_amount: number | null
          status: string | null
          subsidiary_id: string
          time_period: string
          updated_at: string | null
          variance_percentage: number | null
        }
        Insert: {
          actual_amount?: number | null
          budgeted_amount: number
          category: string
          created_at?: string | null
          created_by: string
          description?: string | null
          id?: string
          period_end?: string
          period_start?: string
          remaining_amount?: number | null
          status?: string | null
          subsidiary_id: string
          time_period?: string
          updated_at?: string | null
          variance_percentage?: number | null
        }
        Update: {
          actual_amount?: number | null
          budgeted_amount?: number
          category?: string
          created_at?: string | null
          created_by?: string
          description?: string | null
          id?: string
          period_end?: string
          period_start?: string
          remaining_amount?: number | null
          status?: string | null
          subsidiary_id?: string
          time_period?: string
          updated_at?: string | null
          variance_percentage?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "budget_subsidiary_id_fkey"
            columns: ["subsidiary_id"]
            isOneToOne: false
            referencedRelation: "subsidiaries"
            referencedColumns: ["id"]
          },
        ]
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
          subsidiary_id: string
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
          subsidiary_id: string
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
          subsidiary_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "drivers_subsidiary_id_fkey"
            columns: ["subsidiary_id"]
            isOneToOne: false
            referencedRelation: "subsidiaries"
            referencedColumns: ["id"]
          },
        ]
      }
      fuel_log: {
        Row: {
          created_at: string | null
          created_by: string
          date: string
          driver_id: string | null
          fuel_source: string
          fuel_source_type: string | null
          fuel_type: Database["public"]["Enums"]["fuel_type_enum"] | null
          fuel_volume: number
          id: string
          internal_tank_id: string | null
          km_driven: number | null
          mileage: number | null
          odometer_reading: number
          previous_reading: number | null
          rate_per_liter: number | null
          subsidiary_id: string
          tank_level_after: number | null
          tank_level_before: number | null
          total_cost: number | null
          unit: Database["public"]["Enums"]["fuel_unit_enum"] | null
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
          fuel_source_type?: string | null
          fuel_type?: Database["public"]["Enums"]["fuel_type_enum"] | null
          fuel_volume: number
          id?: string
          internal_tank_id?: string | null
          km_driven?: number | null
          mileage?: number | null
          odometer_reading: number
          previous_reading?: number | null
          rate_per_liter?: number | null
          subsidiary_id: string
          tank_level_after?: number | null
          tank_level_before?: number | null
          total_cost?: number | null
          unit?: Database["public"]["Enums"]["fuel_unit_enum"] | null
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
          fuel_source_type?: string | null
          fuel_type?: Database["public"]["Enums"]["fuel_type_enum"] | null
          fuel_volume?: number
          id?: string
          internal_tank_id?: string | null
          km_driven?: number | null
          mileage?: number | null
          odometer_reading?: number
          previous_reading?: number | null
          rate_per_liter?: number | null
          subsidiary_id?: string
          tank_level_after?: number | null
          tank_level_before?: number | null
          total_cost?: number | null
          unit?: Database["public"]["Enums"]["fuel_unit_enum"] | null
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
            foreignKeyName: "fuel_log_internal_tank_id_fkey"
            columns: ["internal_tank_id"]
            isOneToOne: false
            referencedRelation: "fuel_tanks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fuel_log_subsidiary_id_fkey"
            columns: ["subsidiary_id"]
            isOneToOne: false
            referencedRelation: "subsidiaries"
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
          fuel_type: Database["public"]["Enums"]["fuel_type_enum"] | null
          id: string
          invoice_number: string | null
          purchase_date: string
          rate_per_liter: number
          subsidiary_id: string
          tank_id: string | null
          total_cost: number
          unit: Database["public"]["Enums"]["fuel_unit_enum"] | null
          updated_at: string | null
          vendor_id: string | null
          volume: number
        }
        Insert: {
          created_at?: string | null
          created_by: string
          fuel_type?: Database["public"]["Enums"]["fuel_type_enum"] | null
          id?: string
          invoice_number?: string | null
          purchase_date: string
          rate_per_liter: number
          subsidiary_id: string
          tank_id?: string | null
          total_cost: number
          unit?: Database["public"]["Enums"]["fuel_unit_enum"] | null
          updated_at?: string | null
          vendor_id?: string | null
          volume: number
        }
        Update: {
          created_at?: string | null
          created_by?: string
          fuel_type?: Database["public"]["Enums"]["fuel_type_enum"] | null
          id?: string
          invoice_number?: string | null
          purchase_date?: string
          rate_per_liter?: number
          subsidiary_id?: string
          tank_id?: string | null
          total_cost?: number
          unit?: Database["public"]["Enums"]["fuel_unit_enum"] | null
          updated_at?: string | null
          vendor_id?: string | null
          volume?: number
        }
        Relationships: [
          {
            foreignKeyName: "fuel_purchases_subsidiary_id_fkey"
            columns: ["subsidiary_id"]
            isOneToOne: false
            referencedRelation: "subsidiaries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fuel_purchases_tank_id_fkey"
            columns: ["tank_id"]
            isOneToOne: false
            referencedRelation: "fuel_tanks"
            referencedColumns: ["id"]
          },
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
          subsidiary_id: string
          updated_by: string
        }
        Insert: {
          capacity?: number
          current_level?: number
          id?: string
          last_updated?: string | null
          low_level_threshold?: number | null
          subsidiary_id: string
          updated_by: string
        }
        Update: {
          capacity?: number
          current_level?: number
          id?: string
          last_updated?: string | null
          low_level_threshold?: number | null
          subsidiary_id?: string
          updated_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "fuel_tank_subsidiary_id_fkey"
            columns: ["subsidiary_id"]
            isOneToOne: false
            referencedRelation: "subsidiaries"
            referencedColumns: ["id"]
          },
        ]
      }
      fuel_tanks: {
        Row: {
          capacity: number
          created_at: string | null
          created_by: string
          current_volume: number
          fuel_type: Database["public"]["Enums"]["fuel_type_enum"]
          id: string
          is_active: boolean | null
          low_threshold: number
          subsidiary_id: string
          tank_location: string | null
          unit: Database["public"]["Enums"]["fuel_unit_enum"]
          updated_at: string | null
        }
        Insert: {
          capacity: number
          created_at?: string | null
          created_by: string
          current_volume?: number
          fuel_type: Database["public"]["Enums"]["fuel_type_enum"]
          id?: string
          is_active?: boolean | null
          low_threshold?: number
          subsidiary_id: string
          tank_location?: string | null
          unit?: Database["public"]["Enums"]["fuel_unit_enum"]
          updated_at?: string | null
        }
        Update: {
          capacity?: number
          created_at?: string | null
          created_by?: string
          current_volume?: number
          fuel_type?: Database["public"]["Enums"]["fuel_type_enum"]
          id?: string
          is_active?: boolean | null
          low_threshold?: number
          subsidiary_id?: string
          tank_location?: string | null
          unit?: Database["public"]["Enums"]["fuel_unit_enum"]
          updated_at?: string | null
        }
        Relationships: []
      }
      internal_tank_transactions: {
        Row: {
          cost_per_unit: number | null
          created_at: string | null
          created_by: string
          fuel_log_id: string | null
          id: string
          level_after: number | null
          level_before: number | null
          quantity: number
          remarks: string | null
          subsidiary_id: string
          tank_id: string
          total_cost: number | null
          transaction_date: string | null
          transaction_type: string
          unit: Database["public"]["Enums"]["fuel_unit_enum"] | null
          updated_at: string | null
          vehicle_id: string | null
          vendor_id: string | null
        }
        Insert: {
          cost_per_unit?: number | null
          created_at?: string | null
          created_by: string
          fuel_log_id?: string | null
          id?: string
          level_after?: number | null
          level_before?: number | null
          quantity: number
          remarks?: string | null
          subsidiary_id: string
          tank_id: string
          total_cost?: number | null
          transaction_date?: string | null
          transaction_type: string
          unit?: Database["public"]["Enums"]["fuel_unit_enum"] | null
          updated_at?: string | null
          vehicle_id?: string | null
          vendor_id?: string | null
        }
        Update: {
          cost_per_unit?: number | null
          created_at?: string | null
          created_by?: string
          fuel_log_id?: string | null
          id?: string
          level_after?: number | null
          level_before?: number | null
          quantity?: number
          remarks?: string | null
          subsidiary_id?: string
          tank_id?: string
          total_cost?: number | null
          transaction_date?: string | null
          transaction_type?: string
          unit?: Database["public"]["Enums"]["fuel_unit_enum"] | null
          updated_at?: string | null
          vehicle_id?: string | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "internal_tank_transactions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "internal_tank_transactions_fuel_log_id_fkey"
            columns: ["fuel_log_id"]
            isOneToOne: false
            referencedRelation: "fuel_log"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "internal_tank_transactions_subsidiary_id_fkey"
            columns: ["subsidiary_id"]
            isOneToOne: false
            referencedRelation: "subsidiaries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "internal_tank_transactions_tank_id_fkey"
            columns: ["tank_id"]
            isOneToOne: false
            referencedRelation: "fuel_tanks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "internal_tank_transactions_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "internal_tank_transactions_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_categories: {
        Row: {
          created_at: string | null
          created_by: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          subsidiary_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          subsidiary_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          subsidiary_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_categories_subsidiary_id_fkey"
            columns: ["subsidiary_id"]
            isOneToOne: false
            referencedRelation: "subsidiaries"
            referencedColumns: ["id"]
          },
        ]
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
          subsidiary_id: string
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
          subsidiary_id: string
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
          subsidiary_id?: string
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
            foreignKeyName: "maintenance_log_subsidiary_id_fkey"
            columns: ["subsidiary_id"]
            isOneToOne: false
            referencedRelation: "subsidiaries"
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
      maintenance_rules: {
        Row: {
          advance_warning_days: number | null
          advance_warning_km: number | null
          created_at: string
          created_by: string
          description: string | null
          estimated_cost: number | null
          estimated_duration_hours: number | null
          id: string
          is_active: boolean
          maintenance_type: string
          mileage_interval: number | null
          required_parts: Json | null
          rule_logic: string
          rule_name: string
          subsidiary_id: string
          time_interval_days: number | null
          updated_at: string
          vehicle_types: string[] | null
        }
        Insert: {
          advance_warning_days?: number | null
          advance_warning_km?: number | null
          created_at?: string
          created_by: string
          description?: string | null
          estimated_cost?: number | null
          estimated_duration_hours?: number | null
          id?: string
          is_active?: boolean
          maintenance_type: string
          mileage_interval?: number | null
          required_parts?: Json | null
          rule_logic?: string
          rule_name: string
          subsidiary_id: string
          time_interval_days?: number | null
          updated_at?: string
          vehicle_types?: string[] | null
        }
        Update: {
          advance_warning_days?: number | null
          advance_warning_km?: number | null
          created_at?: string
          created_by?: string
          description?: string | null
          estimated_cost?: number | null
          estimated_duration_hours?: number | null
          id?: string
          is_active?: boolean
          maintenance_type?: string
          mileage_interval?: number | null
          required_parts?: Json | null
          rule_logic?: string
          rule_name?: string
          subsidiary_id?: string
          time_interval_days?: number | null
          updated_at?: string
          vehicle_types?: string[] | null
        }
        Relationships: []
      }
      odometer_readings: {
        Row: {
          created_at: string | null
          created_by: string
          current_location: string | null
          id: string
          notes: string | null
          odometer_reading: number
          reading_date: string
          subsidiary_id: string
          updated_at: string | null
          vehicle_id: string
        }
        Insert: {
          created_at?: string | null
          created_by: string
          current_location?: string | null
          id?: string
          notes?: string | null
          odometer_reading: number
          reading_date: string
          subsidiary_id: string
          updated_at?: string | null
          vehicle_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string
          current_location?: string | null
          id?: string
          notes?: string | null
          odometer_reading?: number
          reading_date?: string
          subsidiary_id?: string
          updated_at?: string | null
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_odometer_readings_created_by"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "odometer_readings_subsidiary_id_fkey"
            columns: ["subsidiary_id"]
            isOneToOne: false
            referencedRelation: "subsidiaries"
            referencedColumns: ["id"]
          },
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
          subsidiary_id: string
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
          subsidiary_id: string
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
          subsidiary_id?: string
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
          {
            foreignKeyName: "parts_master_subsidiary_id_fkey"
            columns: ["subsidiary_id"]
            isOneToOne: false
            referencedRelation: "subsidiaries"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          default_subsidiary_id: string | null
          email: string
          full_name: string
          id: string
          is_active: boolean | null
          is_super_admin: boolean | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          subsidiary_access: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          default_subsidiary_id?: string | null
          email: string
          full_name: string
          id?: string
          is_active?: boolean | null
          is_super_admin?: boolean | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          subsidiary_access?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          default_subsidiary_id?: string | null
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean | null
          is_super_admin?: boolean | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          subsidiary_access?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_default_subsidiary_id_fkey"
            columns: ["default_subsidiary_id"]
            isOneToOne: false
            referencedRelation: "subsidiaries"
            referencedColumns: ["id"]
          },
        ]
      }
      scheduled_maintenance_alerts: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          alert_type: string
          auto_ticket_created: boolean | null
          created_at: string
          created_ticket_id: string | null
          current_mileage: number | null
          days_remaining: number | null
          due_date: string | null
          due_mileage: number | null
          id: string
          is_acknowledged: boolean | null
          km_remaining: number | null
          maintenance_rule_id: string
          subsidiary_id: string
          updated_at: string
          vehicle_id: string
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_type?: string
          auto_ticket_created?: boolean | null
          created_at?: string
          created_ticket_id?: string | null
          current_mileage?: number | null
          days_remaining?: number | null
          due_date?: string | null
          due_mileage?: number | null
          id?: string
          is_acknowledged?: boolean | null
          km_remaining?: number | null
          maintenance_rule_id: string
          subsidiary_id: string
          updated_at?: string
          vehicle_id: string
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_type?: string
          auto_ticket_created?: boolean | null
          created_at?: string
          created_ticket_id?: string | null
          current_mileage?: number | null
          days_remaining?: number | null
          due_date?: string | null
          due_mileage?: number | null
          id?: string
          is_acknowledged?: boolean | null
          km_remaining?: number | null
          maintenance_rule_id?: string
          subsidiary_id?: string
          updated_at?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_maintenance_alerts_created_ticket_id_fkey"
            columns: ["created_ticket_id"]
            isOneToOne: false
            referencedRelation: "service_tickets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheduled_maintenance_alerts_maintenance_rule_id_fkey"
            columns: ["maintenance_rule_id"]
            isOneToOne: false
            referencedRelation: "maintenance_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      service_ticket_approvals: {
        Row: {
          action: Database["public"]["Enums"]["approval_action"]
          approver_id: string
          comments: string | null
          created_at: string
          id: string
          modifications: string | null
          modified_completion_date: string | null
          modified_labor_cost_limit: number | null
          modified_parts_cost_limit: number | null
          modified_total_cost_limit: number | null
          modified_vendor_id: string | null
          subsidiary_id: string
          ticket_id: string
        }
        Insert: {
          action: Database["public"]["Enums"]["approval_action"]
          approver_id: string
          comments?: string | null
          created_at?: string
          id?: string
          modifications?: string | null
          modified_completion_date?: string | null
          modified_labor_cost_limit?: number | null
          modified_parts_cost_limit?: number | null
          modified_total_cost_limit?: number | null
          modified_vendor_id?: string | null
          subsidiary_id: string
          ticket_id: string
        }
        Update: {
          action?: Database["public"]["Enums"]["approval_action"]
          approver_id?: string
          comments?: string | null
          created_at?: string
          id?: string
          modifications?: string | null
          modified_completion_date?: string | null
          modified_labor_cost_limit?: number | null
          modified_parts_cost_limit?: number | null
          modified_total_cost_limit?: number | null
          modified_vendor_id?: string | null
          subsidiary_id?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_ticket_approvals_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "service_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      service_ticket_attachments: {
        Row: {
          created_at: string
          file_name: string
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          ticket_id: string
          uploaded_by: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          ticket_id: string
          uploaded_by: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          ticket_id?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_ticket_attachments_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "service_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      service_ticket_comments: {
        Row: {
          comment_text: string
          created_at: string
          id: string
          is_internal: boolean | null
          ticket_id: string
          user_id: string
        }
        Insert: {
          comment_text: string
          created_at?: string
          id?: string
          is_internal?: boolean | null
          ticket_id: string
          user_id: string
        }
        Update: {
          comment_text?: string
          created_at?: string
          id?: string
          is_internal?: boolean | null
          ticket_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_ticket_comments_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "service_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      service_tickets: {
        Row: {
          actual_labor_cost: number | null
          actual_parts_cost: number | null
          actual_total_cost: number | null
          approved_at: string | null
          assigned_vendor_id: string | null
          completed_at: string | null
          completion_notes: string | null
          created_at: string
          created_by: string
          description: string
          estimated_labor_cost: number | null
          estimated_labor_hours: number | null
          estimated_labor_rate: number | null
          estimated_parts_cost: number | null
          estimated_total_cost: number | null
          id: string
          maintenance_log_id: string | null
          priority: Database["public"]["Enums"]["ticket_priority"]
          requested_completion_date: string | null
          scheduled_date: string | null
          scheduled_time: string | null
          status: Database["public"]["Enums"]["ticket_status"]
          submitted_at: string | null
          subsidiary_id: string
          ticket_number: string
          ticket_type: Database["public"]["Enums"]["ticket_type"]
          title: string
          updated_at: string
          urgency: Database["public"]["Enums"]["ticket_urgency"]
          vehicle_id: string
          work_completed_at: string | null
          work_started_at: string | null
        }
        Insert: {
          actual_labor_cost?: number | null
          actual_parts_cost?: number | null
          actual_total_cost?: number | null
          approved_at?: string | null
          assigned_vendor_id?: string | null
          completed_at?: string | null
          completion_notes?: string | null
          created_at?: string
          created_by: string
          description: string
          estimated_labor_cost?: number | null
          estimated_labor_hours?: number | null
          estimated_labor_rate?: number | null
          estimated_parts_cost?: number | null
          estimated_total_cost?: number | null
          id?: string
          maintenance_log_id?: string | null
          priority?: Database["public"]["Enums"]["ticket_priority"]
          requested_completion_date?: string | null
          scheduled_date?: string | null
          scheduled_time?: string | null
          status?: Database["public"]["Enums"]["ticket_status"]
          submitted_at?: string | null
          subsidiary_id: string
          ticket_number: string
          ticket_type?: Database["public"]["Enums"]["ticket_type"]
          title: string
          updated_at?: string
          urgency?: Database["public"]["Enums"]["ticket_urgency"]
          vehicle_id: string
          work_completed_at?: string | null
          work_started_at?: string | null
        }
        Update: {
          actual_labor_cost?: number | null
          actual_parts_cost?: number | null
          actual_total_cost?: number | null
          approved_at?: string | null
          assigned_vendor_id?: string | null
          completed_at?: string | null
          completion_notes?: string | null
          created_at?: string
          created_by?: string
          description?: string
          estimated_labor_cost?: number | null
          estimated_labor_hours?: number | null
          estimated_labor_rate?: number | null
          estimated_parts_cost?: number | null
          estimated_total_cost?: number | null
          id?: string
          maintenance_log_id?: string | null
          priority?: Database["public"]["Enums"]["ticket_priority"]
          requested_completion_date?: string | null
          scheduled_date?: string | null
          scheduled_time?: string | null
          status?: Database["public"]["Enums"]["ticket_status"]
          submitted_at?: string | null
          subsidiary_id?: string
          ticket_number?: string
          ticket_type?: Database["public"]["Enums"]["ticket_type"]
          title?: string
          updated_at?: string
          urgency?: Database["public"]["Enums"]["ticket_urgency"]
          vehicle_id?: string
          work_completed_at?: string | null
          work_started_at?: string | null
        }
        Relationships: []
      }
      subsidiaries: {
        Row: {
          business_type: string
          contact_person: string | null
          created_at: string | null
          created_by: string | null
          email: string | null
          gstin: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          phone: string | null
          registered_address: string | null
          subsidiary_code: string
          subsidiary_name: string
          updated_at: string | null
        }
        Insert: {
          business_type: string
          contact_person?: string | null
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          gstin?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          phone?: string | null
          registered_address?: string | null
          subsidiary_code: string
          subsidiary_name: string
          updated_at?: string | null
        }
        Update: {
          business_type?: string
          contact_person?: string | null
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          gstin?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          phone?: string | null
          registered_address?: string | null
          subsidiary_code?: string
          subsidiary_name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subsidiaries_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
          subsidiary_id: string
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
          subsidiary_id: string
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
          subsidiary_id?: string
          updated_at?: string | null
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_documents_subsidiary_id_fkey"
            columns: ["subsidiary_id"]
            isOneToOne: false
            referencedRelation: "subsidiaries"
            referencedColumns: ["id"]
          },
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
          default_fuel_type: string | null
          fuel_type: Database["public"]["Enums"]["fuel_type"]
          fuel_types: Json | null
          id: string
          insurance_expiry: string | null
          make: string
          model: string
          permit_expiry: string | null
          puc_expiry: string | null
          purchase_date: string | null
          rc_expiry: string | null
          status: Database["public"]["Enums"]["vehicle_status"] | null
          subsidiary_id: string
          tank_capacity: number | null
          tank_capacity_cng: number | null
          tank_capacity_diesel: number | null
          tank_capacity_petrol: number | null
          updated_at: string | null
          vehicle_name: string | null
          vehicle_number: string
          year: number | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          default_driver_id?: string | null
          default_fuel_type?: string | null
          fuel_type: Database["public"]["Enums"]["fuel_type"]
          fuel_types?: Json | null
          id?: string
          insurance_expiry?: string | null
          make: string
          model: string
          permit_expiry?: string | null
          puc_expiry?: string | null
          purchase_date?: string | null
          rc_expiry?: string | null
          status?: Database["public"]["Enums"]["vehicle_status"] | null
          subsidiary_id: string
          tank_capacity?: number | null
          tank_capacity_cng?: number | null
          tank_capacity_diesel?: number | null
          tank_capacity_petrol?: number | null
          updated_at?: string | null
          vehicle_name?: string | null
          vehicle_number: string
          year?: number | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          default_driver_id?: string | null
          default_fuel_type?: string | null
          fuel_type?: Database["public"]["Enums"]["fuel_type"]
          fuel_types?: Json | null
          id?: string
          insurance_expiry?: string | null
          make?: string
          model?: string
          permit_expiry?: string | null
          puc_expiry?: string | null
          purchase_date?: string | null
          rc_expiry?: string | null
          status?: Database["public"]["Enums"]["vehicle_status"] | null
          subsidiary_id?: string
          tank_capacity?: number | null
          tank_capacity_cng?: number | null
          tank_capacity_diesel?: number | null
          tank_capacity_petrol?: number | null
          updated_at?: string | null
          vehicle_name?: string | null
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
          {
            foreignKeyName: "vehicles_subsidiary_id_fkey"
            columns: ["subsidiary_id"]
            isOneToOne: false
            referencedRelation: "subsidiaries"
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
          subsidiary_id: string
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
          subsidiary_id: string
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
          subsidiary_id?: string
          updated_at?: string | null
          vendor_type?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "vendors_subsidiary_id_fkey"
            columns: ["subsidiary_id"]
            isOneToOne: false
            referencedRelation: "subsidiaries"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_actual_spending: {
        Args: { p_category: string; p_start_date: string; p_end_date: string }
        Returns: number
      }
      calculate_document_status: {
        Args: { expiry_date: string }
        Returns: string
      }
      check_scheduled_maintenance: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      generate_ticket_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_setting: {
        Args: { setting_key: string }
        Returns: Json
      }
      get_user_accessible_subsidiaries: {
        Args: Record<PropertyKey, never>
        Returns: string[]
      }
      get_user_default_subsidiary: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_user_super_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      update_setting: {
        Args: { setting_key: string; setting_value: Json; user_id?: string }
        Returns: boolean
      }
    }
    Enums: {
      approval_action:
        | "approve"
        | "approve_with_modifications"
        | "request_info"
        | "reject"
      document_type: "rc" | "insurance" | "permit" | "puc" | "license" | "other"
      fuel_type: "petrol" | "diesel" | "cng" | "electric"
      fuel_type_enum: "diesel" | "petrol" | "cng"
      fuel_unit_enum: "liters" | "kg"
      maintenance_type: "breakdown" | "preventive" | "scheduled"
      ticket_priority: "critical" | "high" | "medium" | "low"
      ticket_status:
        | "draft"
        | "submitted"
        | "approved"
        | "rejected"
        | "in_progress"
        | "completed"
        | "cancelled"
      ticket_type: "breakdown" | "preventive" | "scheduled"
      ticket_urgency: "immediate" | "within_24h" | "within_week" | "scheduled"
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
      approval_action: [
        "approve",
        "approve_with_modifications",
        "request_info",
        "reject",
      ],
      document_type: ["rc", "insurance", "permit", "puc", "license", "other"],
      fuel_type: ["petrol", "diesel", "cng", "electric"],
      fuel_type_enum: ["diesel", "petrol", "cng"],
      fuel_unit_enum: ["liters", "kg"],
      maintenance_type: ["breakdown", "preventive", "scheduled"],
      ticket_priority: ["critical", "high", "medium", "low"],
      ticket_status: [
        "draft",
        "submitted",
        "approved",
        "rejected",
        "in_progress",
        "completed",
        "cancelled",
      ],
      ticket_type: ["breakdown", "preventive", "scheduled"],
      ticket_urgency: ["immediate", "within_24h", "within_week", "scheduled"],
      user_role: ["admin", "manager", "fuel_manager", "viewer"],
      vehicle_status: ["active", "inactive", "maintenance", "sold"],
    },
  },
} as const
