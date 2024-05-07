"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { messageSchema } from "@/schemas/messageSchema";
import { ApiResponse } from "@/types/ApiResponse";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCompletion } from "ai/react";
import axios, { AxiosError } from "axios";
import { Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import messagesSuggestion from "@/message-suggestion.json";
import { Skeleton } from "@/components/ui/skeleton";

const specialChar = "||";
const message = "User exists.";

const parseStringMessage = (messageString: string): string[] => {
  return messageString.split(specialChar);
};

const initialMessageString = [
  "If you could travel anywhere in the world, where would you go and why?",
  "What's your favorite book or movie, and what do you love about it?",
  "If you could have any superpower, what would it be and how would you use it?",
];

// handle all bugs related to session
const Page = () => {
  // not enough Credit :P
  // const {
  //   complete,
  //   completion,
  //   isLoading: isSuggestLoading,
  //   error,
  // } = useCompletion({
  //   api: "/api/suggest-messages",
  //   initialCompletion: initialMessageString,
  // });
  const router = useRouter();
  const { data: session, status } = useSession();
  const params = useParams<{ username: string }>();
  const username = params.username;
  const [isFollower, setIsFollower] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [messageCard, setMessageCard] = useState([]);
  const [isFetched, setIsFetched] = useState(false);

  useEffect(() => {
    async function getdata() {
      try {
        const resposne = await axios.get(`/api/find-user?username=${username}`);
        if (resposne.data.message !== message) {
          router.replace("/");
        }
        if(session){
          const followedUserRes = await axios.get("/api/get-following");
          const followedUser = followedUserRes.data.followedUser;
          followedUser.map((user: string) => {
            if (user === username) {
              setIsFollower(true);
            }
          });
          setIsMounted(true)
        }
        const content = await axios.get(
          `/api/get-answered-messages?username=${username}`
        );
        // //console.log(content.data.response)
        setIsFetched(true);
        setMessageCard(content.data.response);
      } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>;
        // //console.log(axiosError);
      }
    }
    getdata();
  }, [session]);

  

  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const form = useForm({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      content: "",
    },
  });

  const handleClick = (message: string) => {
    form.setValue("content", message);
  };
  const [followLoadind, setFollowLoadind] = useState(false)
  const addFollowing = async () => {
    setFollowLoadind(true)
    try {
      const response = await axios.post("/api/get-following", {
        username,
      });
      toast({
        title: response.data.message,
      });
      router.refresh();
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      //console.log(axiosError);
      toast({
        title: "Failed",
        description:
          axiosError.message || "Something went wrong,Please try again!!",
        variant: "destructive",
      });
    }finally{
      setFollowLoadind(false)
    }
  };
  const removeFollowing = async () => {
    
    try {
      const response=await axios.post(`/api/unfollow?username=${username}`)
      setIsFollower(false)
      toast({
        title:response.data.message
      })
    } catch (error) {
      const axiosError=error as AxiosError<ApiResponse>
      toast({
        title:axiosError.response?.data.message||`failed to unfollow ${username} `
      })
    }
  };
  async function onSubmit(data: z.infer<typeof messageSchema>) {
    setIsLoading(true);
    try {
      const response = await axios.post<ApiResponse>("/api/send-messages", {
        ...data,
        username,
      });
      toast({
        title: "Message sent successfully",
      });

      form.reset({ ...form.getValues(), content: "" });
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      //console.log("failed to send message");
      toast({
        title: "Failed",
        description:
          axiosError.response?.data.message ?? "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const fetchSuggestedMessages = async () => {
    // not enough credit :P
    // try {
    //   complete("");
    // } catch (error) {
    //   const axiosError = error as AxiosError<ApiResponse>;
    //   //console.log("failed to send message");
    //   toast({
    //     title: "Failed",
    //     description:
    //       axiosError.response?.data.message ?? "Failed to send message",
    //     variant: "destructive",
    //   });
    // }
    const suggestion = messagesSuggestion[Math.round(Math.random() * 100)];
    //console.log(suggestion);
    form.setValue("content", suggestion);
  };
  if (!session || !session.user || !isFetched) {
    return <SkeletonPublicProfile />;
  }
  return (
    <div className="container mx-auto my-8 p-6 bg-white rounded max-w-4xl">
      <div className="mb-4 flex justify-between">
        <h3 className="text-3xl font-bold text-center">Public Profile Link</h3>
        <div className="flex justify-center ">
          {isMounted && session.user.username !== username && (
            <div className="">
              {!isFollower ? (
                <Button onClick={addFollowing}>Follow</Button>
              ) : (
                <Button onClick={removeFollowing}>unfollow</Button>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(messageCard.length ?? 0) > 0 &&
          messageCard.map((message: z.infer<typeof messageSchema>, index) => (
            <div
              className="bg-white border border-gray-200 rounded-lg overflow-hidden"
              key={index}
            >
              <div className="p-4">
                <h4 className="text-lg font-semibold mb-2">
                  {message.content}
                </h4>
                <p className="text-gray-700">{message.answer}</p>
              </div>
            </div>
          ))}
      </div>
      <div className=" mt-5 ">
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
      </div>
      <div className="space-y-4 my-8">
        <div className="space-y-2">
          <Button
            onClick={fetchSuggestedMessages}
            className="my-4"
            // disabled={isSuggestLoading}
          >
            Suggest Messages
          </Button>
          <p>Click on any message below to select it.</p>
        </div>
        <Card>
          <CardHeader>
            <h3 className="text-xl font-semibold">Messages</h3>
          </CardHeader>
          <CardContent className="flex flex-col space-y-4 overflow-y-auto max-h-72">
            {initialMessageString.map((message, index) => (
              <Button
                key={index}
                variant="outline"
                className="mb-2 w-[550px] md:w-full"
                onClick={() => handleClick(message)}
              >
                {message}
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>
      <Separator className="my-6" />
      {!session && (
        <div className="text-center">
          <div className="mb-4">Get Your Message Board</div>
          <Link href={"/sign-up"}>
            <Button>Create Your Account</Button>
          </Link>
        </div>
      )}
    </div>
  );
};

function SkeletonPublicProfile() {
  return (
    <div className="container mx-auto my-8 p-6 bg-white rounded max-w-4xl">
      <div className="mb-4 flex justify-between">
        <h1 className="text-4xl font-bold text-center">
          <Skeleton className="h-10 w-60" />
        </h1>
        <div className="flex justify-center">
          <SkeletonButton />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
      <div className="mt-5">
        <SkeletonForm />
      </div>
      <div className="space-y-4 my-8">
        <div className="space-y-2">
          <SkeletonButton />
          <SkeletonText />
        </div>
        <SkeletonCard />
      </div>
      <div className="my-6">
        <SkeletonText />
      </div>
      <div className="text-center">
        <div className="mb-4">
          <SkeletonText />
        </div>
        <SkeletonButton />
      </div>
    </div>
  );
}


function SkeletonCard() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="p-4">
        <Skeleton className="h-6 w-full mb-2" />
        <Skeleton className=" h-28 w-full" />
      </div>
    </div>
  );
}

function SkeletonForm() {
  return (
    <div className="p-6 space-y-6">
      <SkeletonFormField />
      <SkeletonFormField />
      <SkeletonButton />
    </div>
  );
}

function SkeletonFormField() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-6 w-full" />
      <Skeleton className="h-24 w-full" />
    </div>
  );
}

function SkeletonButton() {
  return (
    <Skeleton className="h-10 w-28" />
  );
}

function SkeletonText() {
  return (
    <Skeleton className="h-6 w-40" />
  );
}

export default Page;
