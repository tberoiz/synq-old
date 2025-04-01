import type { Database } from "./database.types";

export type UserPreferences = Database["public"]["Tables"]["user_preferences"]["Row"];
export type UserPreferencesInsert = Database["public"]["Tables"]["user_preferences"]["Insert"];
export type UserPreferencesUpdate = Database["public"]["Tables"]["user_preferences"]["Update"];

export interface UserSettings {
  user: {
    id: string;
    email: string;
    full_name: string;
    avatar_url: string;
  };
  preferences: UserPreferences;
} 