"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useToast } from "@synq/ui/use-toast";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@synq/ui/form";
import { Switch } from "@synq/ui/switch";
import { Button } from "@synq/ui/button";
import { updateUserPreferences } from "@synq/supabase/queries";

const notificationsFormSchema = z.object({
  communication_emails: z.boolean(),
  marketing_emails: z.boolean(),
  social_emails: z.boolean(),
  security_emails: z.boolean(),
});

type NotificationsFormValues = z.infer<typeof notificationsFormSchema>;

const defaultValues: Partial<NotificationsFormValues> = {
  communication_emails: false,
  marketing_emails: false,
  social_emails: true,
  security_emails: true,
};

type NotificationsFormProps = {
  initialData?: {
    notifications_enabled?: boolean;
    email_notifications?: boolean;
    push_notifications?: boolean;
  };
};

export function NotificationsForm({ initialData }: NotificationsFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<NotificationsFormValues>({
    resolver: zodResolver(notificationsFormSchema),
    defaultValues: {
      communication_emails: initialData?.notifications_enabled ?? defaultValues.communication_emails,
      marketing_emails: initialData?.email_notifications ?? defaultValues.marketing_emails,
      social_emails: initialData?.push_notifications ?? defaultValues.social_emails,
      security_emails: defaultValues.security_emails,
    },
  });

  async function onSubmit(data: NotificationsFormValues) {
    try {
      setIsLoading(true);
      
      // Map form values to database fields
      const preferences = {
        notifications_enabled: data.communication_emails,
        email_notifications: data.marketing_emails,
        push_notifications: data.social_emails,
      };

      await updateUserPreferences(preferences);

      toast({
        title: "Success",
        description: "Your notification preferences have been updated.",
      });

      // Refresh the page to show updated data
      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="communication_emails"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">
                    Communication emails
                  </FormLabel>
                  <FormDescription>
                    Receive emails about your account activity.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isLoading}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="marketing_emails"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Marketing emails</FormLabel>
                  <FormDescription>
                    Receive emails about new products, features, and more.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isLoading}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="social_emails"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Social emails</FormLabel>
                  <FormDescription>
                    Receive emails for friend requests, follows, and more.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isLoading}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="security_emails"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Security emails</FormLabel>
                  <FormDescription>
                    Receive emails about your account activity and security.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isLoading}
                    aria-readonly
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving...</span>
              </div>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
