"use server";

import { UserMetadata } from "@supabase/supabase-js";
import { createClient } from "../client/server";

// Error handling utility
function handleSupabaseError(error: any, operation: string): never {
  throw new Error(`${operation} failed: ${error.message}`);
}

// TODO: If user is not found, logout and redirect to login page
export async function getUserId(): Promise<string> {
  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError) handleSupabaseError(userError, "Get user");
  if (!userData.user)
    handleSupabaseError(new Error("User not found"), "Get user");

  return userData.user.id;
}

export async function getUserMetadata(): Promise<UserMetadata> {
  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError) handleSupabaseError(userError, "Get user");
  return userData.user?.user_metadata || "";
}
