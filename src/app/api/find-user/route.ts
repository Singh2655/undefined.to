import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { Message } from "@/model/User";
import { usernameValidation } from "@/schemas/signUpSchema";
import { z } from "zod";

const UsernameQuerySchema = z.object({
  username: usernameValidation,
});

export async function GET(req: Request) {
  await dbConnect();

  try {
    const { searchParams } = new URL(req.url);
    const queryParams = {
      username: searchParams.get("username"),
    };
    const result = UsernameQuerySchema.safeParse(queryParams);
    //console.log("result", result);

    if (!result.success) {
      const usernameErrors = result.error.format().username?._errors || [];

      return Response.json(
        {
          success: false,
          message:
            usernameErrors.length > 0
              ? usernameErrors.join(", ")
              : "Invalid query parameter",
        },
        { status: 400 }
      );
    }
    const { username } = result.data;
    const user = await UserModel.findOne({ username }).exec();
    if (!user) {
      return Response.json(
        {
          success: true,
          message: "User not found.",
        },
        {
          status: 201,
        }
      );
    }

    return Response.json(
      {
        success: true,
        message: "User exists.",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    //console.log("failed to send message to user", error);
    return Response.json(
      {
        success: false,
        message: "failed to send message to user",
      },
      {
        status: 500,
      }
    );
  }
}
