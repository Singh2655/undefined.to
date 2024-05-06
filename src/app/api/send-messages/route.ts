import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { Message } from "@/model/User";

export async function POST(req: Request) {
  await dbConnect();
  const { username, content } = await req.json();

  try {
    const user = await UserModel.findOne({ username }).exec();
    if (!user) {
      return Response.json(
        {
          success: false,
          message: "User not found.",
        },
        {
          status: 404,
        }
      );
    }

    if (!user.isAcceptingMessage) {
      return Response.json(
        {
          success: false,
          message: "user is not accepting messages.",
        },
        {
          status: 403,
        }
      );
    }

    const newMessage = {
      content,
      createdAt: new Date(),
      isAnswered: false,
      answer: "",
    };

    user.messages.push(newMessage as Message);
    await user.save();

    return Response.json(
      {
        success: true,
        message: "Message sent successfully.",
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
