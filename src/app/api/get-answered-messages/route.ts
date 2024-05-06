import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { User } from "next-auth";
import mongoose from "mongoose";
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
    //console.log("get answered username", queryParams.username);
    const response = await UserModel.aggregate([
      { $match: { username: queryParams.username } },
      { $unwind: "$messages" },
      { $match: { "messages.isAnswered": true } },
      {
        $project: {
          _id: 0,
          content: "$messages.content",
          answer: "$messages.answer",
          createdAt: "$messages.createdAt",
        },
      },
    ]).exec();
    return Response.json(
      {
        success: true,
        response,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    //console.log("failed to fetch the content", error);
    return Response.json(
      {
        success: false,
        message: "failed to fetch the content",
      },
      {
        status: 500,
      }
    );
  }
}
