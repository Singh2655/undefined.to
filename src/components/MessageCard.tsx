// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
//   AlertDialogTrigger,
// } from "@/components/ui/alert-dialog";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";

// import { Button } from "@/components/ui/button";
// import { MailCheck, MailPlus, X } from "lucide-react";
// import { Message } from "@/model/User";
// import { useToast } from "./ui/use-toast";
// import axios, { AxiosError } from "axios";
// import { cn } from "@/lib/utils";
// import dayjs from "dayjs";
// import { Input } from "./ui/input";
// import { Textarea } from "./ui/textarea";
// import { ApiResponse } from "@/types/ApiResponse";
// import { useRouter } from "next/navigation";
// import { useState } from "react";

// type MessageCardProps = {
//   message: Message;
//   onMessageDelete: (messageId: string) => void;
// };
// const MessageCard = ({ message, onMessageDelete }: MessageCardProps) => {
//   const { toast } = useToast();
//   const router = useRouter();
//   const [answer,setAnswer]=useState("")
//   const handleDeleteConfirm = async () => {
//     try {
//       const response = await axios.delete<ApiResponse>(
//         `/api/delete-message/${message._id}`
//       );
//       toast({
//         title: response.data.message,
//       });
//       onMessageDelete(message._id);
//       router.refresh();
//     } catch (error) {
//       const axiosError = error as AxiosError<ApiResponse>;
//       toast({
//         title: "Error",
//         description:
//           axiosError.response?.data.message ?? "Failed to delete message",
//         variant: "destructive",
//       });
//     }
//   };
//   const handleAnswer=async()=>{
//     //console.log("this is messageID",message._id)
//    try {
//      const response=await axios.post('/api/answer-message',{
//        answer,
//        messageId:message._id
//      })
//      toast({
//       title: response.data.message,
//     });
//    } catch (error) {
//     const axiosError = error as AxiosError<ApiResponse>;
//       toast({
//         title: "Error",
//         description:
//           axiosError.response?.data.message ?? "Failed to delete message",
//         variant: "destructive",
//       });
//    }
//   }
//   return (
//     <Card className="card-bordered">
//       <CardHeader>
//         <div className="flex justify-between items-center">
//           <CardTitle>{message.content}</CardTitle>
//           <div className="flex flex-col justify-between  border-r-2">
//             <AlertDialog>
//               <AlertDialogTrigger asChild>
//                   <X className="w-5 h-5 bg-red-200 rounded-sm" />
//               </AlertDialogTrigger>
//               <AlertDialogContent>
//                 <AlertDialogHeader>
//                   <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
//                   <AlertDialogDescription>
//                     This action cannot be undone. This will permanently delete
//                     this message.
//                   </AlertDialogDescription>
//                 </AlertDialogHeader>
//                 <AlertDialogFooter>
//                   <AlertDialogCancel>Cancel</AlertDialogCancel>
//                   <AlertDialogAction onClick={handleDeleteConfirm}>
//                     Continue
//                   </AlertDialogAction>
//                 </AlertDialogFooter>
//               </AlertDialogContent>
//             </AlertDialog>
//             {message.isAnswered ? (
//               <Dialog>
//               <DialogTrigger><MailCheck /></DialogTrigger>
//               <DialogContent>
//                 <DialogHeader>
//                   <DialogTitle>Your answer!!</DialogTitle>
//                   <DialogDescription>
//                     <p>{message.answer}</p>
//                   </DialogDescription>
//                 </DialogHeader>
//               </DialogContent>
//             </Dialog>
//             ) : (
//               <Dialog>
//                 <DialogTrigger><MailPlus/></DialogTrigger>
//                 <DialogContent>
//                   <DialogHeader>
//                     <DialogTitle>Are you absolutely sure?</DialogTitle>
//                     <DialogDescription>
//                       <Textarea onChange={(e)=>setAnswer(e.target.value)}  placeholder="Type your message here." />
//                     </DialogDescription>
//                   </DialogHeader>
//                   <Button onClick={handleAnswer}>submit</Button>
//                 </DialogContent>
//               </Dialog>
//             )}
//           </div>
//         </div>
//         <div className="text-sm">
//           {dayjs(message.createdAt).format("MMM D, YYYY h:mm A")}
//         </div>
//       </CardHeader>
//     </Card>
//   );
// };

// export default MessageCard;

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { MailCheck, MailPlus, X } from "lucide-react";
import { Message } from "@/model/User";
import { useToast } from "./ui/use-toast";
import axios, { AxiosError } from "axios";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { ApiResponse } from "@/types/ApiResponse";
import { useRouter } from "next/navigation";
import { useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
type MessageCardProps = {
  message: Message;
  onMessageDelete: (messageId: string) => void;
};
const MessageCard = ({ message, onMessageDelete }: MessageCardProps) => {
  const { toast } = useToast();
  const router = useRouter();
  const [answer, setAnswer] = useState("");
  const handleDeleteConfirm = async () => {
    try {
      const response = await axios.delete<ApiResponse>(
        `/api/delete-message/${message._id}`
      );
      toast({
        title: response.data.message,
      });
      onMessageDelete(message._id);
      router.refresh();
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: "Error",
        description:
          axiosError.response?.data.message ?? "Failed to delete message",
        variant: "destructive",
      });
    }
  };
  const handleAnswer = async () => {
    //console.log("this is messageID",message._id)
    try {
      const response = await axios.post("/api/answer-message", {
        answer,
        messageId: message._id,
      });
      toast({
        title: response.data.message,
      });
      DialogPrimitive.Close;
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: "Error",
        description:
          axiosError.response?.data.message ?? "Failed to delete message",
        variant: "destructive",
      });
    }
  };
  return (
    <Card className="card-bordered">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{message.content}</CardTitle>
          <div className="flex flex-col">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <X className="w-5 h-5 bg-red-200 rounded-sm mb-5" />
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    this message.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteConfirm}>
                    Continue
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            {message.isAnswered ? (
              <Dialog>
                <DialogTrigger>
                  <MailCheck />
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Your answer!!</DialogTitle>
                    <DialogDescription>
                      <p>{message.answer}</p>
                    </DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            ) : (
              <Dialog>
                <DialogTrigger>
                  <MailPlus />
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="mb-4">
                      {message.content}
                    </DialogTitle>
                    <DialogDescription>
                      <Textarea
                        onChange={(e) => setAnswer(e.target.value)}
                        placeholder="Type your message here."
                      />
                    </DialogDescription>
                  </DialogHeader>
                  <Button onClick={handleAnswer}>submit</Button>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
        <div className="text-sm">
          {dayjs(message.createdAt).format("MMM D, YYYY h:mm A")}
        </div>
      </CardHeader>
    </Card>
  );
};

export default MessageCard;
