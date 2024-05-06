
import { useSession } from "next-auth/react";

export function useGetSession(){
    const {data:session}=useSession() 
    return session;
}