"use client";

import MessageCard from "@/components/MessageCard";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { Message } from "@/model/User";
import { acceptMessageSchema } from "@/schemas/acceptMessageSchema";
import { ApiResponse } from "@/types/ApiResponse";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { Loader2, RefreshCcw } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

const Page = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSwitchLoading, setIsSwitchLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const handleDeleteMessage = (messageId: string) => {
    //console.log("this is messageId",messageId)
    setMessages(messages.filter((message) => message.id !== messageId));
    router.refresh();
  };

  const handleAnswerMessage = async (messageId: string, answer: string) => {
    try {
      const response = await axios.post("/api/answer-message", {
        messageId,
        answer,
      });
    } catch (error) {}
  };

  const { data: session } = useSession();
  const form = useForm({
    resolver: zodResolver(acceptMessageSchema),
  });
  const { register, watch, setValue } = form;
  const acceptMessages = watch("acceptMessages");
  const fetchAcceptMessage = useCallback(async () => {
    setIsSwitchLoading(true);
    try {
      const response = await axios.get("/api/accept-messages");
      setValue("acceptMessages", response.data.isAcceptingMessage);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: "Error",
        description:
          axiosError.response?.data.message ||
          "Failed to fetch message settings",
        variant: "destructive",
      });
    } finally {
      setIsSwitchLoading(false);
    }
  }, [setValue, toast]);

  const fetchMessages = useCallback(
    async (refresh = false) => {
      setIsLoading(true);
      try {
        const response = await axios.get("/api/get-messages");
        setMessages(response.data.message || []);
        if (refresh) {
          toast({
            title: "Refreshed Messages",
            description: "Showing latest messages",
          });
        }
      } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>;
        //console.log(axiosError)
        toast({
          title: "Error",
          description: "Failed to fetch messages",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  useEffect(() => {
    if (!session || !session.user) return;
    fetchAcceptMessage();
    fetchMessages();
  }, [session, fetchAcceptMessage, fetchMessages]);

  const handleSwitchChange = async () => {
    try {
      const response = await axios.post("/api/accept-messages", {
        acceptMessage: !acceptMessages,
      });

      setValue("acceptMessages", !acceptMessages);
      toast({
        title: response.data.message,
      });
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: "Error",
        description: "Failed to switch message accepting state",
        variant: "destructive",
      });
    }
  };

  if (!session || !session.user) {
    return <SkeletonUserDashboard/>
  }

  const { username } = session.user;
  const baseUrl = `${window.location.protocol}//${window.location.host}`;
  const profileUrl = `${baseUrl}/u/${username}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(profileUrl);
    toast({
      title: "URL copied",
      description: "url copied to clipboard successfully!!",
    });
  };
  const handlePublicPage=()=>{
    if(session){
      router.replace(`/u/${username}`)
    }
  }
  return (
    <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl">
      <h1 className="text-4xl font-bold mb-4 cursor-pointer" onMouseDown={handlePublicPage}>User Dashboard</h1>

      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Copy Your Unique Link</h2>{" "}
        <div className="flex items-center">
          <input
            type="text"
            value={profileUrl}
            disabled
            className="input input-bordered w-full p-2 mr-2"
          />
          <Button onClick={copyToClipboard}>Copy</Button>
        </div>
      </div>

      <div className="mb-4">
        <Switch
          {...register("acceptMessages")}
          checked={acceptMessages}
          onCheckedChange={handleSwitchChange}
          disabled={isSwitchLoading}
        />
        <span className="ml-2">
          Accept Messages: {acceptMessages ? "On" : "Off"}
        </span>
      </div>
      <Separator />

      <Button
        className="mt-4"
        variant="outline"
        onClick={(e) => {
          e.preventDefault();
          fetchMessages(true);
        }}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <RefreshCcw className="h-4 w-4" />
        )}
      </Button>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        {messages.length > 0 ? (
          messages.map((message, index) => (
            <MessageCard
              key={index}
              message={message}
              onMessageDelete={handleDeleteMessage}
            />
          ))
        ) : (
          <p>No messages to display.</p>
        )}
      </div>
    </div>
  );
};

function SkeletonUserDashboard() {
  return (
    <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl">
      <h1 className="text-4xl font-bold mb-4">
        <Skeleton className="h-12 w-40" />
      </h1>

      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">
          <Skeleton className="h-8 w-40" />
        </h2>{" "}
        <div className="flex items-center">
          <SkeletonInput />
          <SkeletonButton />
        </div>
      </div>

      <div className="mb-4">
        <SkeletonSwitch />
        <span className="ml-2">
          <SkeletonText />
        </span>
      </div>
      <SeparatorSkeleton />

      <SkeletonButtonRefresh />
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        <SkeletonMessageCard />
        <SkeletonMessageCard />
      </div>
    </div>
  );
}

function SkeletonInput() {
  return (
    <Skeleton className="input input-bordered w-full p-2 mr-2" />
  );
}

function SkeletonButton() {
  return (
    <Skeleton className="h-10 w-20" />
  );
}

function SkeletonSwitch() {
  return (
    <Skeleton className="w-12 h-6" />
  );
}

function SkeletonText() {
  return (
    <Skeleton className="h-6 w-20" />
  );
}

function SeparatorSkeleton() {
  return (
    <Skeleton className="h-0.5 w-full my-4" />
  );
}

function SkeletonButtonRefresh() {
  return (
    <Skeleton className="h-10 w-10" />
  );
}

function SkeletonMessageCard() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="p-4">
        <Skeleton className="h-6 w-full mb-2" />
        <Skeleton className="h-16 w-full" />
      </div>
    </div>
  );
}

export default Page;
