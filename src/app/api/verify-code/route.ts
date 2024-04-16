import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";


export async function POST(req:Request){
    await dbConnect()

    try {
        const {username,code}=await req.json()
        const decodedUsername=decodeURIComponent(username)
        const user=await UserModel.findOne({username:decodedUsername})
        if(!user){
            return Response.json(
                {
                  success: false,
                  message: "User not found",
                },
                {
                  status: 404,
                }
              );
        }

        const isCodeValid=user.verifyCode===code
        const isCodeNotExpiry=new Date(user.verifyCodeExpiry)>new Date()

        if(isCodeNotExpiry && isCodeValid){
            return Response.json(
                {
                  success: true,
                  message: "Account verified",
                },
                {
                  status: 200,
                }
              );
        }
        if(!isCodeNotExpiry){
            return Response.json(
                {
                  success: false,
                  message: "Verify token is expired.Please signup again to get new verify-code",
                },
                {
                  status: 500,
                }
              );
        }
        return Response.json(
            {
              success: false,
              message: "Verify code is incorrect",
            },
            {
              status: 500,
            }
          );

    } catch (error) {
        console.log("error checking username", error);
        return Response.json(
          {
            success: false,
            message: "Error checking username",
          },
          {
            status: 500,
          }
        );
    }
}
