"use server";

import { Provider, UserMetadata } from "@supabase/supabase-js";
import { createClient } from "../client/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

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

export async function signUpWithPassword(prevState: any, formData: FormData) {
  const supabase = await createClient();

  // Get the host from headers
  const headersList = await headers();
  const host = headersList.get("host") || "";
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  const origin = `${protocol}://${host}`;

  const credentials = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    options: {
      emailRedirectTo: `${origin}/api/auth/callback`,
      data: {
        full_name: formData.get("full_name") as string,
        avatar_url:
          "https://github.com/iamtelmo/synq/blob/main/apps/web/public/user/avatar_placeholder.webp",
      },
    },
  };

  if (!credentials.email || !credentials.password) {
    return { success: false, error: "Email and password are required" };
  }

  const { error } = await supabase.auth.signUp(credentials);

  const existingUserErrorCodes = ["user_already_exists", "email_exists"];

  if (existingUserErrorCodes.includes(error?.code || "")) {
    const { error: loginFailed } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (loginFailed) {
      return { sucess: false, error: "User already exists" };
    }
  }
  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, redirectTo: "/auth/confirm" };
}

export async function signIn(prevState: any, formData: FormData) {
  const supabase = await createClient();
  const credentials = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { error } = await supabase.auth.signInWithPassword(credentials);

  if (error?.message === "Email not confirmed") {
    return {
      success: false,
      redirectTo: "/auth/confirm",
    };
  }

  if (error) {
    return {
      error: error.message,
      success: false,
    };
  }

  return {
    success: true,
    redirectTo: "/",
  };
}

export async function signInWithOAuth(provider: Provider) {
  const supabase = await createClient();
  const redirectUrl = `${window.location.origin}/api/auth/callback`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: redirectUrl,
    },
  });

  if (error) {
    redirect("/auth/signup");
  }

  if (data?.url) {
    return redirect(data.url);
  }

  return redirect("/");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/auth/signin");
}

export async function resendConfirmationEmail(email: string) {
  const supabase = await createClient();
  const headersList = await headers();
  const host = headersList.get("host") || "";
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  const origin = `${protocol}://${host}`;

  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: {
      emailRedirectTo: `${origin}/api/auth/callback`,
    },
  });

  if (error) {
    return { error: "Failed to resend confirmation email" };
  }

  return { success: true };
}
