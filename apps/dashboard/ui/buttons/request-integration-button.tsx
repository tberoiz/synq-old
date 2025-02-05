"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "@refrom/ui/use-toast";
import { Button } from "@refrom/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@refrom/ui/form";
import { Input } from "@refrom/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@refrom/ui/popover";

const integrationFormSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: "Integration name must be at least 2 characters.",
    })
    .max(30, {
      message: "Integration name must not be longer than 30 characters.",
    }),
  link: z
    .string()
    .url({
      message: "Please enter a valid URL for the integration page.",
    })
    .min(1, {
      message: "Integration page link is required.",
    }),
});

type IntegrationFormValues = z.infer<typeof integrationFormSchema>;

export function RequestIntegrationButton() {
  const { toast } = useToast();
  const form = useForm<IntegrationFormValues>({
    resolver: zodResolver(integrationFormSchema),
    defaultValues: {
      name: "",
      link: "",
    },
  });

  function onSubmit(data: IntegrationFormValues) {
    toast({
      title: "Thank you for your request! We appreciate your support and will consider it for future updates ✨",
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    });
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="secondary">Request Integration</Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[520px]">
        <div className="flex flex-col space-y-2 text-center sm:text-left">
          <h3 className="text-lg font-semibold">Request Integration</h3>
          <p className="text-sm text-muted-foreground">
            Fill out the form below to request integration with your system.
          </p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Integration Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Integration name" {...field} />
                  </FormControl>
                  <FormDescription>
                    This is the name of the integration you want to request.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="link"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Integration Page Link</FormLabel>
                  <FormControl>
                    <Input placeholder="Integration page link" {...field} />
                  </FormControl>
                  <FormDescription>
                    Provide the URL for the integration page.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" size="sm" className="px-4">
              Submit Request
            </Button>
          </form>
        </Form>
      </PopoverContent>
    </Popover>
  );
}
