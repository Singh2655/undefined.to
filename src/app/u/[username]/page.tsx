"use client";

import React, { useEffect, useState } from "react";
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
import { useParams, useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import axios, { AxiosError } from "axios";
import { useToast } from "@/components/ui/use-toast";
import { ApiResponse } from "@/types/ApiResponse";
import { useCompletion } from 'ai/react';
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useSession } from "next-auth/react";

const specialChar="||";
const message="User exists.";

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
  const router=useRouter()
  const {data:session,status}=useSession()
  const params = useParams<{ username: string }>();
  const username = params.username;
  const [isFollower,setIsFollower]=useState(false)

  useEffect(()=>{
    async function getdata(){
      try {
        const resposne=await axios.get(`/api/find-user?username=${username}`)
        if(resposne.data.message!==message){
          router.replace('/')
        }
        const followedUserRes=await axios.get('/api/get-following')
        const followedUser=followedUserRes.data.followedUser;
        followedUser.map((user,idx)=>{
          if(user===username){
            setIsFollower(true)
          }
        })
      } catch (error) {
        const axiosError=error as AxiosError<ApiResponse>
        console.log(axiosError)
      }
    }
    getdata()
  },[])


  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const form = useForm({
    resolver: zodResolver(messageSchema),
    defaultValues:{
      content:""
    }
  });

const handleClick=(message:string)=>{
  form.setValue('content',message)
}
const addFollowing=async()=>{
  try {
    const response=await axios.post('/api/get-following',{
      username
    })
    toast({
      title:response.data.message
    })
    router.refresh()
  } catch (error) {
    const axiosError=error as AxiosError<ApiResponse>
    console.log(axiosError)
    toast({
      title:"Failed",
      description:axiosError.message||"Something went wrong,Please try again!!",
      variant:"destructive"
    })
  }
}
  async function onSubmit(data: z.infer<typeof messageSchema>){
    setIsLoading(true)
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
    finally{
      setIsLoading(false)
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
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-center">
          Public Profile Link
        </h1>
        <div className="flex justify-center">
          {session && (session.user.username!==username) && (!isFollower) && (
            <Button onClick={addFollowing}>Follow</Button>
          )}
        </div>
      </div>
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
        <Card >
          <CardHeader >
            <h3 className="text-xl font-semibold">Messages</h3>
          </CardHeader>
          <CardContent  className="flex flex-col space-y-4 overflow-y-auto max-h-72">
            {error ? (
              <p className="text-red-500">{error.message}</p>
            ) : (
              parseStringMessage(completion).map((message, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="mb-2 w-[550px] md:w-full"
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
       {!session &&<div className="text-center">
        <div className="mb-4">Get Your Message Board</div>
        <Link href={'/sign-up'}>
          <Button>Create Your Account</Button>
        </Link>
      </div>}
    </div>
  );
};

export default Page;

