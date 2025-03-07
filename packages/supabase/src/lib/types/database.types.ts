export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      user_inventory_groups: {
        Row: {
          id: string;
          name: string;
          user_id: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          user_id?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          user_id?: string | null;
        };
        Relationships: [];
      };
      user_inventory_items: {
        Row: {
          created_at: string | null;
          default_cogs: number | null;
          id: string;
          image_urls: string[] | null;
          inventory_group_id: string | null;
          is_archived: boolean;
          listing_price: number;
          name: string;
          sku: string | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          default_cogs?: number | null;
          id?: string;
          image_urls?: string[] | null;
          inventory_group_id?: string | null;
          is_archived?: boolean;
          listing_price: number;
          name: string;
          sku?: string | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          default_cogs?: number | null;
          id?: string;
          image_urls?: string[] | null;
          inventory_group_id?: string | null;
          is_archived?: boolean;
          listing_price?: number;
          name?: string;
          sku?: string | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_inventory_items_inventory_group_id_fkey";
            columns: ["inventory_group_id"];
            isOneToOne: false;
            referencedRelation: "user_inventory_groups";
            referencedColumns: ["id"];
          },
        ];
      };
      user_purchase_batches: {
        Row: {
          created_at: string | null;
          id: string;
          name: string;
          status: string;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          name: string;
          status?: string;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          name?: string;
          status?: string;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      user_purchase_items: {
        Row: {
          batch_id: string;
          created_at: string | null;
          id: string;
          item_id: string;
          quantity: number;
          remaining_quantity: number;
          unit_cost: number;
          user_id: string;
        };
        Insert: {
          batch_id: string;
          created_at?: string | null;
          id?: string;
          item_id: string;
          quantity: number;
          remaining_quantity: number;
          unit_cost: number;
          user_id: string;
        };
        Update: {
          batch_id?: string;
          created_at?: string | null;
          id?: string;
          item_id?: string;
          quantity?: number;
          remaining_quantity?: number;
          unit_cost?: number;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_purchase_items_batch_id_fkey";
            columns: ["batch_id"];
            isOneToOne: false;
            referencedRelation: "user_purchase_batches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_purchase_items_item_id_fkey";
            columns: ["item_id"];
            isOneToOne: false;
            referencedRelation: "user_inventory_items";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_purchase_items_item_id_fkey";
            columns: ["item_id"];
            isOneToOne: false;
            referencedRelation: "vw_items_ui_table";
            referencedColumns: ["item_id"];
          },
        ];
      };
      user_sales: {
        Row: {
          created_at: string | null;
          id: string;
          purchase_item_id: string;
          sale_price: number;
          sold_quantity: number;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          purchase_item_id: string;
          sale_price: number;
          sold_quantity: number;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          purchase_item_id?: string;
          sale_price?: number;
          sold_quantity?: number;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_sales_purchase_item_id_fkey";
            columns: ["purchase_item_id"];
            isOneToOne: false;
            referencedRelation: "user_purchase_items";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      vw_items_ui_table: {
        Row: {
          category: string | null;
          item_id: string | null;
          item_name: string | null;
          listing_price: number | null;
          purchase_batches: Json | null;
          sku: string | null;
          total_quantity: number | null;
          total_sold: number | null;
          user_id: string | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;
