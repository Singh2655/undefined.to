import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { User } from "next-auth";
export async function POST(req: Request) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  const user = session?.user;

  if (!session || !user) {
    return Response.json(
      {
        success: false,
        message: "Not Authincated.",
      },
      {
        status: 401,
      }
    );
  }
  const userId = user._id;
  const { acceptMessage } = await req.json();
  try {
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { isAcceptingMessage: acceptMessage },
      { new: true }
    );

    if (!updatedUser) {
      return Response.json(
        {
          success: false,
          message: "failed to get user with given id",
        },
        {
          status: 401,
        }
      );
    }
    return Response.json(
      {
        success: true,
        message: "user statis to accept message is successfully updated",
        updatedUser,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.log("failed to update user status to accept message", error);
    return Response.json(
      {
        success: false,
        message: "failed to update user status to accept message",
      },
      {
        status: 500,
      }
    );
  }
}

export async function GET(req: Request) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  const user = session?.user;

  if (!session || !user) {
    return Response.json(
      {
        success: false,
        message: "Not Authincated.",
      },
      {
        status: 401,
      }
    );
  }
  const userId = user._id;
  try {
    const foundUser = await UserModel.findById(userId);

    if (!foundUser) {
      return Response.json(
        {
          success: false,
          message: "User not found.",
        },
        {
          status: 401,
        }
      );
    }
    return Response.json(
      {
        success: true,
        isAcceptingMessage: foundUser?.isAcceptingMessage,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.log("[ACCEPT_MESSAGE_GET_ERROR]", error);
    return Response.json(
      {
        success: false,
        message: "Error getting the acceptmessage status of the user.",
      },
      {
        status: 500,
      }
    );
  }
}
