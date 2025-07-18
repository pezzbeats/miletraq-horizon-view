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
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          key: string
          updated_at?: string
          value: string
        }
        Update: {
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      budgets: {
        Row: {
          budget_amount: number
          created_at: string
          department_id: string | null
          id: string
          month: string
          type: string
          vehicle_id: string | null
        }
        Insert: {
          budget_amount: number
          created_at?: string
          department_id?: string | null
          id?: string
          month: string
          type: string
          vehicle_id?: string | null
        }
        Update: {
          budget_amount?: number
          created_at?: string
          department_id?: string | null
          id?: string
          month?: string
          type?: string
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "budgets_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "subsidiaries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budgets_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      document_alerts: {
        Row: {
          alert_type: string
          created_at: string
          document_id: string
          document_table: string
          id: string
          sent_at: string | null
        }
        Insert: {
          alert_type: string
          created_at?: string
          document_id: string
          document_table: string
          id?: string
          sent_at?: string | null
        }
        Update: {
          alert_type?: string
          created_at?: string
          document_id?: string
          document_table?: string
          id?: string
          sent_at?: string | null
        }
        Relationships: []
      }
      document_cost_history: {
        Row: {
          cost_amount: number
          created_at: string
          document_id: string
          document_table: string
          expiry_date: string | null
          id: string
          processed_by: string | null
          remarks: string | null
          renewal_type: string
          service_date: string
          updated_at: string
          vendor_id: string | null
        }
        Insert: {
          cost_amount?: number
          created_at?: string
          document_id: string
          document_table: string
          expiry_date?: string | null
          id?: string
          processed_by?: string | null
          remarks?: string | null
          renewal_type?: string
          service_date: string
          updated_at?: string
          vendor_id?: string | null
        }
        Update: {
          cost_amount?: number
          created_at?: string
          document_id?: string
          document_table?: string
          expiry_date?: string | null
          id?: string
          processed_by?: string | null
          remarks?: string | null
          renewal_type?: string
          service_date?: string
          updated_at?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_cost_history_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      driver_documents: {
        Row: {
          created_at: string
          current_cost: number | null
          document_number: string | null
          document_type: Database["public"]["Enums"]["document_type"]
          driver_id: string
          expiry_date: string | null
          file_name: string | null
          file_size: number | null
          file_url: string | null
          id: string
          issue_date: string | null
          notes: string | null
          remarks: string | null
          renewal_date: string | null
          updated_at: string
          vendor_id: string | null
        }
        Insert: {
          created_at?: string
          current_cost?: number | null
          document_number?: string | null
          document_type: Database["public"]["Enums"]["document_type"]
          driver_id: string
          expiry_date?: string | null
          file_name?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          issue_date?: string | null
          notes?: string | null
          remarks?: string | null
          renewal_date?: string | null
          updated_at?: string
          vendor_id?: string | null
        }
        Update: {
          created_at?: string
          current_cost?: number | null
          document_number?: string | null
          document_type?: Database["public"]["Enums"]["document_type"]
          driver_id?: string
          expiry_date?: string | null
          file_name?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          issue_date?: string | null
          notes?: string | null
          remarks?: string | null
          renewal_date?: string | null
          updated_at?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "driver_documents_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "driver_documents_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      driver_vehicle_assignments: {
        Row: {
          action_type: string
          assigned_at: string
          assigned_by: string | null
          created_at: string
          driver_id: string
          id: string
          notes: string | null
          vehicle_id: string
        }
        Insert: {
          action_type: string
          assigned_at?: string
          assigned_by?: string | null
          created_at?: string
          driver_id: string
          id?: string
          notes?: string | null
          vehicle_id: string
        }
        Update: {
          action_type?: string
          assigned_at?: string
          assigned_by?: string | null
          created_at?: string
          driver_id?: string
          id?: string
          notes?: string | null
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "driver_vehicle_assignments_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "driver_vehicle_assignments_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      drivers: {
        Row: {
          address: string | null
          contact: string | null
          created_at: string
          emergency_contact: string | null
          emergency_phone: string | null
          employment_date: string | null
          id: string
          license_number: string | null
          name: string
          photo_url: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          address?: string | null
          contact?: string | null
          created_at?: string
          emergency_contact?: string | null
          emergency_phone?: string | null
          employment_date?: string | null
          id?: string
          license_number?: string | null
          name: string
          photo_url?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          address?: string | null
          contact?: string | null
          created_at?: string
          emergency_contact?: string | null
          emergency_phone?: string | null
          employment_date?: string | null
          id?: string
          license_number?: string | null
          name?: string
          photo_url?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      fuel_logs: {
        Row: {
          cost_per_km: number | null
          driver_name: string | null
          fuel_type: string
          id: string
          issued_at: string
          mileage: number | null
          odometer_km: number | null
          quantity_litres: number
          rate_at_fill: number
          source: string
          total_amount: number
          vehicle_id: string
          vendor_id: string | null
        }
        Insert: {
          cost_per_km?: number | null
          driver_name?: string | null
          fuel_type: string
          id?: string
          issued_at?: string
          mileage?: number | null
          odometer_km?: number | null
          quantity_litres: number
          rate_at_fill: number
          source: string
          total_amount: number
          vehicle_id: string
          vendor_id?: string | null
        }
        Update: {
          cost_per_km?: number | null
          driver_name?: string | null
          fuel_type?: string
          id?: string
          issued_at?: string
          mileage?: number | null
          odometer_km?: number | null
          quantity_litres?: number
          rate_at_fill?: number
          source?: string
          total_amount?: number
          vehicle_id?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fuel_logs_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fuel_logs_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      fuel_tank: {
        Row: {
          current_volume: number
          fuel_type: string
          id: string
          last_updated: string
        }
        Insert: {
          current_volume: number
          fuel_type: string
          id?: string
          last_updated?: string
        }
        Update: {
          current_volume?: number
          fuel_type?: string
          id?: string
          last_updated?: string
        }
        Relationships: []
      }
      maintenance_logs: {
        Row: {
          created_at: string
          downtime_hours: number | null
          id: string
          labour_cost: number | null
          next_due_date: string | null
          next_due_odometer_km: number | null
          odometer_km: number | null
          service_date: string
          service_provider_id: string | null
          task_description: string
          total_cost: number | null
          total_parts_cost: number | null
          type: string
          vehicle_id: string
        }
        Insert: {
          created_at?: string
          downtime_hours?: number | null
          id?: string
          labour_cost?: number | null
          next_due_date?: string | null
          next_due_odometer_km?: number | null
          odometer_km?: number | null
          service_date?: string
          service_provider_id?: string | null
          task_description: string
          total_cost?: number | null
          total_parts_cost?: number | null
          type?: string
          vehicle_id: string
        }
        Update: {
          created_at?: string
          downtime_hours?: number | null
          id?: string
          labour_cost?: number | null
          next_due_date?: string | null
          next_due_odometer_km?: number | null
          odometer_km?: number | null
          service_date?: string
          service_provider_id?: string | null
          task_description?: string
          total_cost?: number | null
          total_parts_cost?: number | null
          type?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_logs_service_provider_id_fkey"
            columns: ["service_provider_id"]
            isOneToOne: false
            referencedRelation: "service_providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_logs_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_parts: {
        Row: {
          id: string
          maintenance_log_id: string
          part_id: string
          quantity: number
          total_cost: number
          unit_cost: number
        }
        Insert: {
          id?: string
          maintenance_log_id: string
          part_id: string
          quantity?: number
          total_cost?: number
          unit_cost?: number
        }
        Update: {
          id?: string
          maintenance_log_id?: string
          part_id?: string
          quantity?: number
          total_cost?: number
          unit_cost?: number
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_parts_maintenance_log_id_fkey"
            columns: ["maintenance_log_id"]
            isOneToOne: false
            referencedRelation: "maintenance_logs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_parts_part_id_fkey"
            columns: ["part_id"]
            isOneToOne: false
            referencedRelation: "parts"
            referencedColumns: ["id"]
          },
        ]
      }
      part_categories: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      part_rate_history: {
        Row: {
          id: string
          logged_at: string
          part_id: string
          source_log_id: string | null
          source_type: string
          unit_cost: number
        }
        Insert: {
          id?: string
          logged_at?: string
          part_id: string
          source_log_id?: string | null
          source_type?: string
          unit_cost: number
        }
        Update: {
          id?: string
          logged_at?: string
          part_id?: string
          source_log_id?: string | null
          source_type?: string
          unit_cost?: number
        }
        Relationships: [
          {
            foreignKeyName: "part_rate_history_part_id_fkey"
            columns: ["part_id"]
            isOneToOne: false
            referencedRelation: "parts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "part_rate_history_source_log_id_fkey"
            columns: ["source_log_id"]
            isOneToOne: false
            referencedRelation: "maintenance_parts"
            referencedColumns: ["id"]
          },
        ]
      }
      part_stock_transactions: {
        Row: {
          created_at: string
          id: string
          part_id: string
          quantity_change: number
          reason: string
          supplier_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          part_id: string
          quantity_change: number
          reason: string
          supplier_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          part_id?: string
          quantity_change?: number
          reason?: string
          supplier_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "part_stock_transactions_part_id_fkey"
            columns: ["part_id"]
            isOneToOne: false
            referencedRelation: "parts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "part_stock_transactions_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      parts: {
        Row: {
          category_id: string
          created_at: string
          current_stock: number
          id: string
          name: string
          reorder_level: number
          unit_cost: number
        }
        Insert: {
          category_id: string
          created_at?: string
          current_stock?: number
          id?: string
          name: string
          reorder_level?: number
          unit_cost?: number
        }
        Update: {
          category_id?: string
          created_at?: string
          current_stock?: number
          id?: string
          name?: string
          reorder_level?: number
          unit_cost?: number
        }
        Relationships: [
          {
            foreignKeyName: "parts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "part_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      service_providers: {
        Row: {
          contact: string | null
          created_at: string
          id: string
          name: string
        }
        Insert: {
          contact?: string | null
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          contact?: string | null
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      subsidiaries: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      tank_refills: {
        Row: {
          id: string
          quantity_litres: number
          rate_per_litre: number
          refilled_at: string
          total_amount: number
          vendor_id: string
        }
        Insert: {
          id?: string
          quantity_litres: number
          rate_per_litre: number
          refilled_at?: string
          total_amount: number
          vendor_id: string
        }
        Update: {
          id?: string
          quantity_litres?: number
          rate_per_litre?: number
          refilled_at?: string
          total_amount?: number
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tank_refills_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      trip_logs: {
        Row: {
          created_at: string
          date: string
          distance_km: number | null
          driver_id: string | null
          end_odometer_km: number
          fuel_type: string | null
          id: string
          notes: string | null
          start_odometer_km: number
          vehicle_id: string
        }
        Insert: {
          created_at?: string
          date: string
          distance_km?: number | null
          driver_id?: string | null
          end_odometer_km: number
          fuel_type?: string | null
          id?: string
          notes?: string | null
          start_odometer_km: number
          vehicle_id: string
        }
        Update: {
          created_at?: string
          date?: string
          distance_km?: number | null
          driver_id?: string | null
          end_odometer_km?: number
          fuel_type?: string | null
          id?: string
          notes?: string | null
          start_odometer_km?: number
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trip_logs_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trip_logs_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_activity_logs: {
        Row: {
          action_details: string | null
          action_type: string
          created_at: string
          id: string
          ip_address: unknown | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action_details?: string | null
          action_type: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action_details?: string | null
          action_type?: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_permissions: {
        Row: {
          created_at: string
          id: string
          module: Database["public"]["Enums"]["app_module"]
          permissions: Database["public"]["Enums"]["permission_type"][]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          module: Database["public"]["Enums"]["app_module"]
          permissions?: Database["public"]["Enums"]["permission_type"][]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          module?: Database["public"]["Enums"]["app_module"]
          permissions?: Database["public"]["Enums"]["permission_type"][]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          created_at: string
          full_name: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          status: Database["public"]["Enums"]["user_status"]
        }
        Insert: {
          created_at?: string
          full_name: string
          id: string
          role?: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["user_status"]
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["user_status"]
        }
        Relationships: []
      }
      vehicle_documents: {
        Row: {
          created_at: string
          current_cost: number | null
          document_number: string | null
          document_type: Database["public"]["Enums"]["document_type"]
          expiry_date: string | null
          file_name: string | null
          file_size: number | null
          file_url: string | null
          id: string
          issue_date: string | null
          notes: string | null
          remarks: string | null
          renewal_date: string | null
          updated_at: string
          vehicle_id: string
          vendor_id: string | null
        }
        Insert: {
          created_at?: string
          current_cost?: number | null
          document_number?: string | null
          document_type: Database["public"]["Enums"]["document_type"]
          expiry_date?: string | null
          file_name?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          issue_date?: string | null
          notes?: string | null
          remarks?: string | null
          renewal_date?: string | null
          updated_at?: string
          vehicle_id: string
          vendor_id?: string | null
        }
        Update: {
          created_at?: string
          current_cost?: number | null
          document_number?: string | null
          document_type?: Database["public"]["Enums"]["document_type"]
          expiry_date?: string | null
          file_name?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          issue_date?: string | null
          notes?: string | null
          remarks?: string | null
          renewal_date?: string | null
          updated_at?: string
          vehicle_id?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_documents_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_documents_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_odometer_history: {
        Row: {
          id: string
          notes: string | null
          odometer_reading: number
          updated_at: string
          updated_by: string | null
          vehicle_id: string
        }
        Insert: {
          id?: string
          notes?: string | null
          odometer_reading: number
          updated_at?: string
          updated_by?: string | null
          vehicle_id: string
        }
        Update: {
          id?: string
          notes?: string | null
          odometer_reading?: number
          updated_at?: string
          updated_by?: string | null
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_odometer_history_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          created_at: string
          current_odometer_km: number | null
          default_driver_id: string | null
          id: string
          make: string
          model: string
          plate_number: string
          primary_fuel_type: string
          secondary_fuel_type: string | null
          subsidiary_id: string | null
          year: number
        }
        Insert: {
          created_at?: string
          current_odometer_km?: number | null
          default_driver_id?: string | null
          id?: string
          make: string
          model: string
          plate_number: string
          primary_fuel_type?: string
          secondary_fuel_type?: string | null
          subsidiary_id?: string | null
          year: number
        }
        Update: {
          created_at?: string
          current_odometer_km?: number | null
          default_driver_id?: string | null
          id?: string
          make?: string
          model?: string
          plate_number?: string
          primary_fuel_type?: string
          secondary_fuel_type?: string | null
          subsidiary_id?: string | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_default_driver_id_fkey"
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
          contact: string | null
          created_at: string
          id: string
          name: string
          type: string | null
        }
        Insert: {
          contact?: string | null
          created_at?: string
          id?: string
          name: string
          type?: string | null
        }
        Update: {
          contact?: string | null
          created_at?: string
          id?: string
          name?: string
          type?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_user_has_permission: {
        Args: {
          module_name: Database["public"]["Enums"]["app_module"]
          permission_type: Database["public"]["Enums"]["permission_type"]
        }
        Returns: boolean
      }
      get_expiring_documents: {
        Args: { days_ahead?: number }
        Returns: {
          id: string
          document_type: Database["public"]["Enums"]["document_type"]
          document_number: string
          expiry_date: string
          days_until_expiry: number
          entity_type: string
          entity_id: string
          entity_name: string
        }[]
      }
      get_vehicles_due_for_maintenance: {
        Args: Record<PropertyKey, never>
        Returns: {
          vehicle_id: string
          plate_number: string
          make: string
          model: string
          current_odometer_km: number
          next_due_odometer_km: number
          next_due_date: string
          due_type: string
          days_overdue: number
          km_overdue: number
        }[]
      }
      has_any_role: {
        Args: { required_roles: Database["public"]["Enums"]["user_role"][] }
        Returns: boolean
      }
      has_role: {
        Args: { required_role: Database["public"]["Enums"]["user_role"] }
        Returns: boolean
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      log_user_activity: {
        Args: {
          p_user_id: string
          p_action_type: string
          p_action_details?: string
          p_ip_address?: unknown
          p_user_agent?: string
        }
        Returns: string
      }
      update_part_stock: {
        Args: { p_part_id: string; p_quantity_change: number }
        Returns: boolean
      }
      user_has_permission: {
        Args: {
          user_id: string
          module_name: Database["public"]["Enums"]["app_module"]
          permission_type: Database["public"]["Enums"]["permission_type"]
        }
        Returns: boolean
      }
    }
    Enums: {
      app_module:
        | "vehicles"
        | "fuel"
        | "maintenance"
        | "inventory"
        | "budgets"
        | "users"
        | "settings"
        | "subsidiaries"
        | "service_providers"
        | "reports"
        | "dashboard"
      document_type:
        | "driving_license"
        | "vehicle_insurance"
        | "pollution_certificate"
        | "road_tax"
        | "permit"
        | "fitness_certificate"
        | "registration_certificate"
        | "puc_certificate"
        | "commercial_permit"
        | "state_permit"
        | "national_permit"
      permission_type: "read" | "write" | "delete" | "admin"
      user_role:
        | "admin"
        | "fuel_manager"
        | "maintenance_manager"
        | "driver"
        | "viewer"
      user_status: "active" | "inactive"
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
      app_module: [
        "vehicles",
        "fuel",
        "maintenance",
        "inventory",
        "budgets",
        "users",
        "settings",
        "subsidiaries",
        "service_providers",
        "reports",
        "dashboard",
      ],
      document_type: [
        "driving_license",
        "vehicle_insurance",
        "pollution_certificate",
        "road_tax",
        "permit",
        "fitness_certificate",
        "registration_certificate",
        "puc_certificate",
        "commercial_permit",
        "state_permit",
        "national_permit",
      ],
      permission_type: ["read", "write", "delete", "admin"],
      user_role: [
        "admin",
        "fuel_manager",
        "maintenance_manager",
        "driver",
        "viewer",
      ],
      user_status: ["active", "inactive"],
    },
  },
} as const
