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
      companies: {
        Row: {
          addresses: Json | null
          brand: string
          created_at: string | null
          email: string
          id: string
          is_active: boolean | null
          name: string
          phone: string | null
          subscription_tier: string | null
          updated_at: string | null
        }
        Insert: {
          addresses?: Json | null
          brand: string
          created_at?: string | null
          email: string
          id?: string
          is_active?: boolean | null
          name: string
          phone?: string | null
          subscription_tier?: string | null
          updated_at?: string | null
        }
        Update: {
          addresses?: Json | null
          brand?: string
          created_at?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          name?: string
          phone?: string | null
          subscription_tier?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      invoice_line_items: {
        Row: {
          created_at: string | null
          description: string
          id: string
          invoice_id: string
          line_number: number | null
          line_total_gross: number | null
          line_total_net: number | null
          master_product_id: string | null
          quantity: number | null
          unit_cost_gross: number | null
          unit_cost_net: number | null
          vat_rate: number | null
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          invoice_id: string
          line_number?: number | null
          line_total_gross?: number | null
          line_total_net?: number | null
          master_product_id?: string | null
          quantity?: number | null
          unit_cost_gross?: number | null
          unit_cost_net?: number | null
          vat_rate?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          invoice_id?: string
          line_number?: number | null
          line_total_gross?: number | null
          line_total_net?: number | null
          master_product_id?: string | null
          quantity?: number | null
          unit_cost_gross?: number | null
          unit_cost_net?: number | null
          vat_rate?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "invoice_line_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_line_items_master_product_id_fkey"
            columns: ["master_product_id"]
            isOneToOne: false
            referencedRelation: "master_products"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          created_at: string | null
          gross_total: number | null
          id: string
          invoice_date: string
          invoice_number: string
          invoice_type: string | null
          location_id: string
          net_total: number | null
          processing_status: string | null
          supplier_id: string
          updated_at: string | null
          vat_total: number | null
        }
        Insert: {
          created_at?: string | null
          gross_total?: number | null
          id?: string
          invoice_date: string
          invoice_number: string
          invoice_type?: string | null
          location_id: string
          net_total?: number | null
          processing_status?: string | null
          supplier_id: string
          updated_at?: string | null
          vat_total?: number | null
        }
        Update: {
          created_at?: string | null
          gross_total?: number | null
          id?: string
          invoice_date?: string
          invoice_number?: string
          invoice_type?: string | null
          location_id?: string
          net_total?: number | null
          processing_status?: string | null
          supplier_id?: string
          updated_at?: string | null
          vat_total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          address: Json | null
          company_id: string
          created_at: string | null
          id: string
          is_active: boolean | null
          location_number: number
          location_type: string
          manager_id: string | null
          name: string
          updated_at: string | null
        }
        Insert: {
          address?: Json | null
          company_id: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          location_number: number
          location_type: string
          manager_id?: string | null
          name: string
          updated_at?: string | null
        }
        Update: {
          address?: Json | null
          company_id?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          location_number?: number
          location_type?: string
          manager_id?: string | null
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_locations_manager"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "locations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      master_products: {
        Row: {
          account: string | null
          article_code: string
          created_at: string | null
          description: string
          ean_code: string
          id: string
          is_active: boolean | null
          unit_size: string | null
          updated_at: string | null
        }
        Insert: {
          account?: string | null
          article_code: string
          created_at?: string | null
          description: string
          ean_code: string
          id?: string
          is_active?: boolean | null
          unit_size?: string | null
          updated_at?: string | null
        }
        Update: {
          account?: string | null
          article_code?: string
          created_at?: string | null
          description?: string
          ean_code?: string
          id?: string
          is_active?: boolean | null
          unit_size?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          baseline_supplier_id: string | null
          baseline_unit_price: number | null
          created_at: string | null
          id: string
          master_product_id: string
          order_id: string
          override_reason: string | null
          quantity: number
          supplier_product_id: string
          total_price: number
          unit_price: number
        }
        Insert: {
          baseline_supplier_id?: string | null
          baseline_unit_price?: number | null
          created_at?: string | null
          id?: string
          master_product_id: string
          order_id: string
          override_reason?: string | null
          quantity: number
          supplier_product_id: string
          total_price: number
          unit_price: number
        }
        Update: {
          baseline_supplier_id?: string | null
          baseline_unit_price?: number | null
          created_at?: string | null
          id?: string
          master_product_id?: string
          order_id?: string
          override_reason?: string | null
          quantity?: number
          supplier_product_id?: string
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_baseline_supplier_id_fkey"
            columns: ["baseline_supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_master_product_id_fkey"
            columns: ["master_product_id"]
            isOneToOne: false
            referencedRelation: "master_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_supplier_product_id_fkey"
            columns: ["supplier_product_id"]
            isOneToOne: false
            referencedRelation: "supplier_products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          baseline_file_reference: string | null
          baseline_upload_date: string | null
          created_at: string | null
          created_by: string
          id: string
          is_baseline_order: boolean
          location_id: string
          notes: string | null
          order_date: string
          status: string | null
          supplier_id: string
          total_amount: number | null
          updated_at: string | null
        }
        Insert: {
          baseline_file_reference?: string | null
          baseline_upload_date?: string | null
          created_at?: string | null
          created_by: string
          id?: string
          is_baseline_order?: boolean
          location_id: string
          notes?: string | null
          order_date: string
          status?: string | null
          supplier_id: string
          total_amount?: number | null
          updated_at?: string | null
        }
        Update: {
          baseline_file_reference?: string | null
          baseline_upload_date?: string | null
          created_at?: string | null
          created_by?: string
          id?: string
          is_baseline_order?: boolean
          location_id?: string
          notes?: string | null
          order_date?: string
          status?: string | null
          supplier_id?: string
          total_amount?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      savings_calculations: {
        Row: {
          baseline_order_id: string
          baseline_price: number
          baseline_supplier_id: string
          best_external_price: number | null
          best_external_supplier_id: string | null
          calculation_date: string | null
          chosen_price: number
          chosen_supplier_id: string
          company_id: string
          delta_vs_baseline: number | null
          id: string
          is_saving: boolean | null
          order_item_id: string
          savings_percentage: number | null
        }
        Insert: {
          baseline_order_id: string
          baseline_price: number
          baseline_supplier_id: string
          best_external_price?: number | null
          best_external_supplier_id?: string | null
          calculation_date?: string | null
          chosen_price: number
          chosen_supplier_id: string
          company_id: string
          delta_vs_baseline?: number | null
          id?: string
          is_saving?: boolean | null
          order_item_id: string
          savings_percentage?: number | null
        }
        Update: {
          baseline_order_id?: string
          baseline_price?: number
          baseline_supplier_id?: string
          best_external_price?: number | null
          best_external_supplier_id?: string | null
          calculation_date?: string | null
          chosen_price?: number
          chosen_supplier_id?: string
          company_id?: string
          delta_vs_baseline?: number | null
          id?: string
          is_saving?: boolean | null
          order_item_id?: string
          savings_percentage?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "savings_calculations_baseline_order_id_fkey"
            columns: ["baseline_order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "savings_calculations_baseline_supplier_id_fkey"
            columns: ["baseline_supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "savings_calculations_best_external_supplier_id_fkey"
            columns: ["best_external_supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "savings_calculations_chosen_supplier_id_fkey"
            columns: ["chosen_supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "savings_calculations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "savings_calculations_order_item_id_fkey"
            columns: ["order_item_id"]
            isOneToOne: false
            referencedRelation: "order_items"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_company_prices: {
        Row: {
          company_id: string
          created_at: string | null
          id: string
          master_product_id: string
          negotiated_price: number
          notes: string | null
          supplier_id: string
          updated_at: string | null
          valid_from: string
          valid_until: string | null
        }
        Insert: {
          company_id: string
          created_at?: string | null
          id?: string
          master_product_id: string
          negotiated_price: number
          notes?: string | null
          supplier_id: string
          updated_at?: string | null
          valid_from?: string
          valid_until?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string | null
          id?: string
          master_product_id?: string
          negotiated_price?: number
          notes?: string | null
          supplier_id?: string
          updated_at?: string | null
          valid_from?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "supplier_company_prices_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_company_prices_master_product_id_fkey"
            columns: ["master_product_id"]
            isOneToOne: false
            referencedRelation: "master_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_company_prices_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_price_history: {
        Row: {
          change_reason: string | null
          changed_at: string | null
          changed_by: string | null
          effective_from: string
          effective_to: string | null
          id: string
          new_price: number | null
          old_price: number | null
          supplier_product_id: string
        }
        Insert: {
          change_reason?: string | null
          changed_at?: string | null
          changed_by?: string | null
          effective_from?: string
          effective_to?: string | null
          id?: string
          new_price?: number | null
          old_price?: number | null
          supplier_product_id: string
        }
        Update: {
          change_reason?: string | null
          changed_at?: string | null
          changed_by?: string | null
          effective_from?: string
          effective_to?: string | null
          id?: string
          new_price?: number | null
          old_price?: number | null
          supplier_product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplier_price_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_price_history_supplier_product_id_fkey"
            columns: ["supplier_product_id"]
            isOneToOne: false
            referencedRelation: "supplier_products"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_products: {
        Row: {
          availability_status: string | null
          current_price: number
          id: string
          is_baseline: boolean
          last_updated: string | null
          master_product_id: string
          supplier_id: string
          supplier_product_code: string | null
          vat_rate: number | null
        }
        Insert: {
          availability_status?: string | null
          current_price: number
          id?: string
          is_baseline?: boolean
          last_updated?: string | null
          master_product_id: string
          supplier_id: string
          supplier_product_code?: string | null
          vat_rate?: number | null
        }
        Update: {
          availability_status?: string | null
          current_price?: number
          id?: string
          is_baseline?: boolean
          last_updated?: string | null
          master_product_id?: string
          supplier_id?: string
          supplier_product_code?: string | null
          vat_rate?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "supplier_products_master_product_id_fkey"
            columns: ["master_product_id"]
            isOneToOne: false
            referencedRelation: "master_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_products_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          company_id: string | null
          contact_info: Json | null
          created_at: string | null
          id: string
          is_active: boolean | null
          is_internal: boolean
          name: string
          updated_at: string | null
        }
        Insert: {
          company_id?: string | null
          contact_info?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_internal?: boolean
          name: string
          updated_at?: string | null
        }
        Update: {
          company_id?: string | null
          contact_info?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_internal?: boolean
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "suppliers_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          company_id: string | null
          created_at: string | null
          first_name: string
          id: string
          last_name: string
          location_id: string | null
          role: string
          theme_mode: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          company_id?: string | null
          created_at?: string | null
          first_name: string
          id: string
          last_name: string
          location_id?: string | null
          role: string
          theme_mode?: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          company_id?: string | null
          created_at?: string | null
          first_name?: string
          id?: string
          last_name?: string
          location_id?: string | null
          role?: string
          theme_mode?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_profiles_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      custom_access_token_hook: {
        Args: { event: Json }
        Returns: Json
      }
      get_baseline_order_savings: {
        Args: { p_baseline_order_id: string }
        Returns: {
          baseline_file_reference: string
          baseline_order_id: string
          baseline_price: number
          baseline_upload_date: string
          best_external_price: number
          chosen_price: number
          delta_vs_baseline: number
          is_saving: boolean
          order_item_id: string
          product_description: string
          quantity: number
          savings_percentage: number
        }[]
      }
      get_company_accounts: {
        Args: { p_company_id: string }
        Returns: {
          account: string
          product_count: number
        }[]
      }
      get_effective_price: {
        Args: {
          p_company_id: string
          p_master_product_id: string
          p_supplier_id: string
        }
        Returns: number
      }
      get_pricing_comparison: {
        Args: {
          p_company_id: string
          p_include_unavailable?: boolean
          p_limit?: number
          p_product_ids?: string[]
          p_supplier_ids?: string[]
        }
        Returns: {
          article_code: string
          availability_status: string
          catalog_price: number
          description: string
          final_price: number
          is_internal: boolean
          is_special_price: boolean
          product_id: string
          special_price_notes: string
          supplier_id: string
          supplier_name: string
          valid_until: string
        }[]
      }
      get_pricing_comparison_pivot: {
        Args: {
          p_company_id: string
          p_include_unavailable?: boolean
          p_limit?: number
          p_product_ids?: string[]
          p_supplier_ids?: string[]
        }
        Returns: {
          account: string
          article_code: string
          description: string
          has_special_prices: boolean
          prices: Json
          product_id: string
          unit_size: string
        }[]
      }
      get_savings_by_account: {
        Args: {
          p_account: string
          p_company_id: string
          p_end_date?: string
          p_start_date?: string
        }
        Returns: {
          account: string
          avg_savings_percentage: number
          calculation_count: number
          company_id: string
          company_name: string
          total_products: number
          total_savings: number
        }[]
      }
      get_savings_by_company: {
        Args: {
          p_company_id: string
          p_end_date?: string
          p_start_date?: string
        }
        Returns: {
          avg_savings_percentage: number
          brand: string
          calculation_count: number
          company_id: string
          company_name: string
          date_range_end: string
          date_range_start: string
          net_savings: number
          overspend_count: number
          savings_count: number
          total_overspend_vs_baseline: number
          total_savings_vs_baseline: number
        }[]
      }
      get_savings_by_location: {
        Args: {
          p_end_date?: string
          p_location_id: string
          p_start_date?: string
        }
        Returns: {
          avg_savings_percentage: number
          calculation_count: number
          company_id: string
          company_name: string
          location_id: string
          location_name: string
          location_type: string
          net_savings: number
          overspend_count: number
          savings_count: number
          total_overspend_vs_baseline: number
          total_savings_vs_baseline: number
        }[]
      }
      get_savings_by_location_and_account: {
        Args: {
          p_account: string
          p_end_date?: string
          p_location_id: string
          p_start_date?: string
        }
        Returns: {
          account: string
          avg_savings_percentage: number
          calculation_count: number
          company_name: string
          location_id: string
          location_name: string
          total_savings: number
        }[]
      }
      get_savings_by_supplier: {
        Args: {
          p_end_date?: string
          p_start_date?: string
          p_supplier_id: string
        }
        Returns: {
          avg_savings_percentage: number
          is_internal: boolean
          overspend_count: number
          savings_count: number
          supplier_id: string
          supplier_name: string
          times_chosen: number
          total_delta_vs_baseline: number
          total_order_value: number
        }[]
      }
      get_savings_by_user: {
        Args: { p_end_date?: string; p_start_date?: string; p_user_id: string }
        Returns: {
          avg_savings_percentage: number
          email: string
          full_name: string
          orders_created: number
          total_order_value: number
          total_savings: number
          user_id: string
        }[]
      }
      get_user_company_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_manager: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_master: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      verify_data_counts: {
        Args: Record<PropertyKey, never>
        Returns: {
          record_count: number
          table_name: string
        }[]
      }
      verify_foreign_keys: {
        Args: Record<PropertyKey, never>
        Returns: {
          column_name: string
          references_column: string
          references_table: string
          table_name: string
        }[]
      }
      verify_tables: {
        Args: Record<PropertyKey, never>
        Returns: {
          table_name: string
        }[]
      }
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
