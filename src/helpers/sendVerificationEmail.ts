import { resend } from "@/lib/resend";
import { ApiResponse } from "@/types/ApiResponse";
import { UserVerificationEmail } from "../../emails/VerificationEmail";

export async function sendVerificationEmail(
    email:string,
    username:string,
    verifyCode:string
):Promise<ApiResponse>{
    try {
        const data = await resend.emails.send({
            from: 'Acme <onboarding@resend.dev>',
            to: email,
            subject: 'Verification Code',
            react: UserVerificationEmail({ username,otp:verifyCode }),
          });
          return {success:true,message:"Email sent successfully"}
    } catch (error) {
        console.log("Error sending verificatin email",error)
        return {success:false,message:"failed to send verification email"}
        
    }
}