"use server";

import { Provider, UserMetadata } from "@supabase/supabase-js";
import { createClient } from "../client/server";
import { redirect } from "next/navigation";
import sharp from "sharp";

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

export async function signInWithOTP(prevState: any, formData: FormData) {
  const supabase = await createClient();
  const credentials = {
    email: formData.get("email") as string,
  };

  const { error } = await supabase.auth.signInWithOtp(credentials);

  if (error) {
    return {
      error: error.message,
      success: false,
    };
  }

  return {
    success: true,
  };
}

export async function verifyOTP(prevState: any, formData: FormData) {
  const supabase = await createClient();
  const credentials = {
    email: formData.get("email") as string,
  };

  const { data: user, error } = await supabase.auth.verifyOtp({
    email: credentials.email,
    token: formData.get("token") as string,
    type: "email",
  });

  if (error) {
    // FIXME: This is a temporary fix to log the error
    console.log("Error verifying OTP:", error);
    if (error.message.includes("Invalid OTP")) {
      return {
        error: "Invalid verification code. Please try again.",
        success: false,
      };
    }
    if (error.message.includes("expired")) {
      return {
        // error: "Verification code has expired. Please request a new one.",
        error: "Invalid verification code. Please try again.",
        success: false,
      };
    }
    return {
      error: error.message,
      success: false,
    };
  }

  // Success case
  if (user?.user) {
    const hasFullName = user.user.user_metadata?.full_name;
    return {
      success: true,
      redirectTo: hasFullName ? "/overview" : "/setup-account",
    };
  }

  // Fallback error case
  return {
    error: "Verification failed. Please try again.",
    success: false,
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
  return redirect("/login");
}

export async function updateUserProfile(prevState: any, formData: FormData) {
  const supabase = await createClient();
  const fullName = formData.get("full_name") as string;
  const avatarFile = formData.get("avatar") as File | null;

  if (!fullName) {
    return {
      error: "Full name is required",
      success: false,
    };
  }

  // Get current user and their avatar URL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      error: "User not authenticated",
      success: false,
    };
  }

  // Initialize avatarUrl with the existing avatar URL
  let avatarUrl = user.user_metadata?.avatar_url;

  if (avatarFile) {
    try {
      // Validate file size (5MB limit)
      if (avatarFile.size > 5 * 1024 * 1024) {
        return {
          error: `File size must be less than 5MB. Your file is ${(avatarFile.size / (1024 * 1024)).toFixed(2)}MB.`,
          success: false,
        };
      }

      // Validate file type
      if (!avatarFile.type.startsWith("image/")) {
        return {
          error: "File must be an image (PNG, JPG, JPEG, GIF, or WebP)",
          success: false,
        };
      }

      let uploadProgress = {
        status: "preparing",
        message: "Preparing image...",
      };

      // If user has an existing avatar, delete it
      if (user.user_metadata?.avatar_url) {
        try {
          uploadProgress = {
            status: "cleaning",
            message: "Removing old avatar...",
          };
          // Extract the file path from the avatar URL
          const avatarUrl = new URL(user.user_metadata.avatar_url);
          const filePath = avatarUrl.pathname.split("/").pop();
          if (filePath) {
            const { error: deleteError } = await supabase.storage
              .from("avatars")
              .remove([`${user.id}/${filePath}`]);

            if (deleteError) {
              console.error("Error deleting old avatar:", deleteError);
              // Continue with upload even if deletion fails
            }
          }
        } catch (error) {
          console.error("Error processing old avatar URL:", error);
          // Continue with upload even if deletion fails
        }
      }

      uploadProgress = { status: "processing", message: "Processing image..." };

      // Convert File to Buffer
      const arrayBuffer = await avatarFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Compress image with progressive quality reduction if needed
      let compressedBuffer = buffer;
      let quality = 60;
      let attempts = 0;
      const maxAttempts = 3;
      const targetSize = 4 * 1024 * 1024; // 4MB target (leaving 1MB buffer)

      while (attempts < maxAttempts) {
        uploadProgress = {
          status: "compressing",
          message: `Compressing image (attempt ${attempts + 1}/${maxAttempts})...`,
        };

        compressedBuffer = await sharp(buffer)
          .resize(400, 400, {
            fit: "cover",
            position: "center",
          })
          .webp({
            quality,
            effort: 6,
          })
          .toBuffer();

        if (compressedBuffer.length <= targetSize) {
          break;
        }

        quality -= 10;
        attempts++;
      }

      if (compressedBuffer.length > 5 * 1024 * 1024) {
        return {
          error:
            "Unable to compress image to required size. Please try a smaller image.",
          success: false,
        };
      }

      uploadProgress = { status: "uploading", message: "Uploading image..." };

      const fileExt = "webp";
      const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = fileName;

      console.log("Attempting to upload compressed file:", {
        fileName,
        originalSize: avatarFile.size,
        compressedSize: compressedBuffer.length,
        compressionRatio:
          ((1 - compressedBuffer.length / avatarFile.size) * 100).toFixed(2) +
          "%",
        quality,
        attempts,
      });

      const { error: uploadError, data } = await supabase.storage
        .from("avatars")
        .upload(filePath, compressedBuffer, {
          cacheControl: "3600",
          upsert: false,
          contentType: "image/webp",
        });

      if (uploadError) {
        console.error("Upload error details:", {
          message: uploadError.message,
          name: uploadError.name,
        });
        return {
          error: `Failed to upload avatar: ${uploadError.message}`,
          success: false,
        };
      }

      console.log("Upload successful:", data);

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);

      avatarUrl = publicUrl;
      console.log("Generated public URL:", avatarUrl);
    } catch (error) {
      console.error("Error handling avatar upload:", error);
      return {
        error:
          error instanceof Error
            ? error.message
            : "Failed to process avatar. Please try again.",
        success: false,
      };
    }
  }

  const { error } = await supabase.auth.updateUser({
    data: {
      full_name: fullName,
      avatar_url: avatarUrl,
    },
  });

  if (error) {
    console.error("Error updating user:", error);
    return {
      error: error.message,
      success: false,
    };
  }

  return {
    success: true,
    redirectTo: "/overview",
    uploadProgress: {
      status: "complete",
      message: "Profile updated successfully!",
    },
  };
}
