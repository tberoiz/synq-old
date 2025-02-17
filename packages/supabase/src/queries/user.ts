import { createClient } from "../utils/client";

export const getUserId = async (): Promise<string> => {
  const supabase = createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw new Error(userError.message);
  if (!userData.user) throw new Error("User not found");
  return userData.user.id;
};
