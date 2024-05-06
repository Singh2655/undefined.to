import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { User } from "next-auth";
import mongoose from "mongoose";

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

  const userId = new mongoose.Types.ObjectId(user._id);
  try {
    const response = await UserModel.aggregate([
      { $match: { _id: userId } },
      { $project: { _id: 0, followedUser: 1 } },
    ]).exec();
    const followedUser = response ? response[0]?.followedUser : [];
    //console.log("followedUser",followedUser)
    return Response.json(
      {
        success: true,
        followedUser,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    //console.log("failed to update user status to accept message", error);
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

// export async function POST(req:Request){
//   await dbConnect();
//   const session = await getServerSession(authOptions);
//   const user = session?.user;
//   const {username}=await req.json()
//   if (!session || !user) {
//     return Response.json(
//       {
//         success: false,
//         message: "Not Authincated.",
//       },
//       {
//         status: 401,
//       }
//     );
//   }

//   if(session.user.username===username){
//     return Response.json(
//       {
//         success:false,
//         message:"Can't follow yourself"
//       },
//       {
//         status:400
//       }
//     )
//   }
//   const userId = new mongoose.Types.ObjectId(user._id);
//   try {
//     await UserModel.updateOne(
//       { _id: userId },
//       { $push: { followedUser: username } }
//     );

//     return Response.json(
//       {
//         success: true,
//         message:"Followed user successfully",
//       },
//       {
//         status: 200,
//       }
//     );
//   } catch (error) {
//     //console.log("failed to follow the user", error);
//     return Response.json(
//       {
//         success: false,
//         message: "failed to follow the user",
//       },
//       {
//         status: 500,
//       }
//     );
//   }
// }

export async function POST(req: Request) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  const user = session?.user;
  const { username } = await req.json();
  if (!session || !user) {
    return Response.json(
      {
        success: false,
        message: "Not Authenticated.",
      },
      {
        status: 401,
      }
    );
  }

  if (session.user.username === username) {
    return Response.json(
      {
        success: false,
        message: "Can't follow yourself",
      },
      {
        status: 400,
      }
    );
  }

  const userId = new mongoose.Types.ObjectId(user._id);
  try {
    const result = await UserModel.findOneAndUpdate(
      { _id: userId, followedUser: { $ne: username } },
      { $addToSet: { followedUser: username } },
      { new: true }
    );

    if (!result) {
      return Response.json(
        {
          success: false,
          message: "User is already followed",
        },
        {
          status: 400,
        }
      );
    }

    return Response.json(
      {
        success: true,
        message: "Followed user successfully",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    //console.log("Failed to follow the user", error);
    return Response.json(
      {
        success: false,
        message: "Failed to follow the user",
      },
      {
        status: 500,
      }
    );
  }
}
