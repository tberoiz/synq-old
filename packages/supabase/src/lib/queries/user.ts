"use server";
import { createClient } from "../client/server";

// Error handling utility
function handleSupabaseError(error: any, operation: string): never {
  throw new Error(`${operation} failed: ${error.message}`);
}

export async function getUserId(): Promise<string> {
  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError) handleSupabaseError(userError, "Get user");
  if (!userData.user)
    handleSupabaseError(new Error("User not found"), "Get user");

  return userData.user.id;
}
