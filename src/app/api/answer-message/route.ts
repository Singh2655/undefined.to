import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { Message } from "@/model/User";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import mongoose from "mongoose";

export async function POST(req: Request) {
  await dbConnect();
  const { messageId, answer } = await req.json();
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
  const dbUser = await UserModel.findOne({
    _id: userId,
  });
  try {
    const response = await UserModel.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(userId),
        },
      },
      // Filter the messages array to include only the message with the given messageId
      {
        $project: {
          message: {
            $filter: {
              input: "$messages",
              as: "msg",
              cond: {
                $eq: ["$$msg._id", new mongoose.Types.ObjectId(messageId)],
              },
            },
          },
        },
      },
      // Unwind the message array to flatten the result
      {
        $unwind: "$message",
      },
      // Project to reshape the output and exclude unnecessary fields
      {
        $project: {
          _id: 0,
          message: "$message",
        },
      },
    ]).exec();

    if (!response || !response.length) {
      return Response.json(
        {
          success: false,
          message: "Message not found.",
        },
        {
          status: 404,
        }
      );
    }
    const message = response[0].message as Message;
    //console.log(message)
    message.isAnswered = true;
    message.answer = answer;
    await UserModel.updateOne(
      { _id: user._id },
      { $pull: { messages: { _id: messageId } } }
    );
    dbUser?.messages.push(message);
    dbUser?.save();
    return Response.json(
      {
        success: true,
        message: "You've answered the question successfully!!",
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
        message: "failed to answer message ",
      },
      {
        status: 500,
      }
    );
  }
}
