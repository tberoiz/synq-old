"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";

import { useToast } from "@synq/ui/use-toast";
import { Button } from "@synq/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@synq/ui/form";
import { Input } from "@synq/ui/input";
import { updateUserProfile } from "@synq/supabase/queries";
import { Avatar, AvatarFallback, AvatarImage } from "@synq/ui/avatar";
import { Camera, Save } from "lucide-react";
import { SynqIcon } from "@ui/shared/icons/icons";
import { cn } from "@synq/ui/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@synq/ui/tooltip";

const accountFormSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: "Name must be at least 2 characters.",
    })
    .max(30, {
      message: "Name must not be longer than 30 characters.",
    }),
});

type AccountFormValues = z.infer<typeof accountFormSchema>;

type AccountFormProps = {
  initialData?: {
    full_name?: string;
    avatar_url?: string;
  };
};

export function AccountForm({ initialData }: AccountFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(initialData?.avatar_url || null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      name: initialData?.full_name || "",
    },
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `Maximum file size is 5MB. Your file is ${formatFileSize(file.size)}.`,
          variant: "destructive",
        });
        return;
      }

      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file type",
          description:
            "Please upload an image file (PNG, JPG, JPEG, GIF, or WebP)",
          variant: "destructive",
        });
        return;
      }

      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  async function onSubmit(data: AccountFormValues) {
    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("full_name", data.name);

      // Only append avatar if a new file is selected
      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

      const result = await updateUserProfile(null, formData);

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Your profile has been updated.",
      });

      // Reset avatar file after successful upload
      setAvatarFile(null);

      // Refresh the page to show updated data
      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="rounded-lg border">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 p-6">
          <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8">
            {/* Left Column - Avatar */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative group">
                <Avatar className="w-24 h-24 ring-2 ring-background ring-offset-2 ring-offset-background">
                  <AvatarImage
                    src={avatarPreview || undefined}
                    alt="Profile picture"
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-muted">
                    <SynqIcon className="w-12 h-12" />
                  </AvatarFallback>
                </Avatar>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isLoading}
                        className={cn(
                          "absolute inset-0 flex items-center justify-center bg-black/50 rounded-full transition-all",
                          "hover:bg-black/60 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                          isLoading
                            ? "opacity-100"
                            : "opacity-0 group-hover:opacity-100"
                        )}
                        aria-label="Update profile picture"
                      >
                        {isLoading ? (
                          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Camera className="w-6 h-6 text-white" />
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Click to update profile picture</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  disabled={isLoading}
                  className="hidden"
                  aria-label="Profile picture upload"
                />
              </div>
              <div className="text-center space-y-1">
                <p className="text-sm font-medium">Profile Picture</p>
                <p className="text-sm text-muted-foreground">
                  Recommended: Square image, max 5MB
                </p>
              </div>
            </div>

            {/* Right Column - Form Fields */}
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Your name"
                        {...field}
                        disabled={isLoading}
                        className="max-w-md"
                      />
                    </FormControl>
                    <FormDescription>
                      This is the name that will be displayed on your profile
                      and in emails.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button
              type="submit"
              size="default"
              disabled={isLoading}
              className="min-w-[120px]"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </div>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
