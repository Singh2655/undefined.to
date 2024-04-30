"use client";

import React, { useState } from "react";
import { Message } from "@/model/User";
import { messageSchema } from "@/schemas/messageSchema";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import axios, { AxiosError } from "axios";
import { useToast } from "@/components/ui/use-toast";
import { ApiResponse } from "@/types/ApiResponse";
import { useCompletion } from 'ai/react';
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const specialChar="||"

const parseStringMessage=(messageString:string):string[]=>{
  return messageString.split(specialChar)
}

const initialMessageString="If you could travel anywhere in the world, where would you go and why?||What's your favorite book or movie, and what do you love about it?||If you could have any superpower, what would it be and how would you use it?"

const Page = () => {
  const {
    complete,
    completion,
    isLoading:isSuggestLoading,
    error
  }=useCompletion({
    api:'/api/suggest-messages',
    initialCompletion:initialMessageString,
  })

  const params = useParams<{ username: string }>();
  const username = params.username;
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const form = useForm({
    resolver: zodResolver(messageSchema),
  });

const handleClick=(message:string)=>{
  form.setValue('content',message)
}
  const onSubmit = async (data: z.infer<typeof messageSchema>) => {
    try {
      const response = await axios.post<ApiResponse>("/api/send-messages", {
        ...data,
        username
      });
      toast({
        title: "Message sent successfully"
      });

      form.reset({...form.getValues(),content:""})
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      console.log("failed to send message");
      toast({
        title: "Failed",
        description:
          axiosError.response?.data.message ?? "Failed to send message",
        variant: "destructive",
      });
    }
  };

  const fetchSuggestedMessages=async()=>{
    try {
      complete('')
    } catch (error) {
      const axiosError=error as AxiosError<ApiResponse>
      console.log("failed to send message");
      toast({
        title: "Failed",
        description:
          axiosError.response?.data.message ?? "Failed to send message",
        variant: "destructive",
      });
    }
  }
  return (
    <div className="container mx-auto my-8 p-6 bg-white rounded max-w-4xl">
     <h1 className="text-4xl font-bold mb-6 text-center">
        Public Profile Link
      </h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Send Anonymous message to @{username}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Write your anonymous message here."
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <div className="flex justify-center">
            {isLoading ? (
              <Button disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait
              </Button>
            ) : (
              <Button type="submit" disabled={isLoading}>
                Send It
              </Button>
            )}
          </div>
        </form>
      </Form>
      <div className="space-y-4 my-8">
        <div className="space-y-2">
          <Button
            onClick={fetchSuggestedMessages}
            className="my-4"
            disabled={isSuggestLoading}
          >
            Suggest Messages
          </Button>
          <p>Click on any message below to select it.</p>
        </div>
        <Card>
          <CardHeader>
            <h3 className="text-xl font-semibold">Messages</h3>
          </CardHeader>
          <CardContent className="flex flex-col space-y-4">
            {error ? (
              <p className="text-red-500">{error.message}</p>
            ) : (
              parseStringMessage(completion).map((message, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="mb-2"
                  onClick={() => handleClick(message)}
                >
                  {message}
                </Button>
              ))
            )}
          </CardContent>
        </Card>
      </div>
      <Separator className="my-6" />
      <div className="text-center">
        <div className="mb-4">Get Your Message Board</div>
        <Link href={'/sign-up'}>
          <Button>Create Your Account</Button>
        </Link>
      </div>
    </div>
  );
};

export default Page;

