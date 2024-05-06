import { getServerSession } from "next-auth";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { User } from "next-auth";
import mongoose from "mongoose";
import { authOptions } from "../../auth/[...nextauth]/options";

export async function DELETE(
  req: Request,
  { params }: { params: { messageId: string } }
) {
  const messageId = params.messageId;
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
  try {
    const updatedResponse = await UserModel.updateOne(
      { _id: user._id },
      { $pull: { messages: { _id: messageId } } }
    );
    if (updatedResponse.modifiedCount === 0) {
      return Response.json(
        {
          success: false,
          message: "Message not found or already deleted.",
        },
        {
          status: 404,
        }
      );
    }
    return Response.json(
      {
        success: true,
        message: "Message deleted.",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    //console.log("error deleting message",error)
    return Response.json(
      {
        success: false,
        message: "Error deleting message.",
      },
      {
        status: 500,
      }
    );
  }
}
