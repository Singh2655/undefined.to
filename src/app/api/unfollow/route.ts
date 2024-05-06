import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { Message } from "@/model/User";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import mongoose from "mongoose";

export async function POST(req: Request) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const queryParams = {
    username: searchParams.get("username"),
  };
  const username = queryParams.username;
  //console.log(messageId)
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
  const userId = new mongoose.Types.ObjectId(user._id);
  try {
    const val=await UserModel.updateOne(
      { _id: user._id },
      { $pull: { followedUser:username} }
    );
    if (val.modifiedCount === 0) {
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
        message: "unfollowed user successfully",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    //console.log("failed to answer message ", error);
    return Response.json(
      {
        success: false,
        message: "failed to unfollow user ",
      },
      {
        status: 500,
      }
    );
  }
}
