import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";

export async function GET(req: Request) {
    await dbConnect();
    try {
        const { searchParams } = new URL(req.url)
        const queryParams = {
            startsWith: searchParams.get("startsWith"),
          };
          console.log("queryParams",queryParams)
        const response = await UserModel.aggregate([
            { $match: { username: { $regex: `^${queryParams.startsWith}`, $options: 'i' } } },
            { $project: { _id: 0, username: 1 } } // Project only the username field
        ]).exec();

        console.log("this is response",response)
        return Response.json({
            success: true,
            allUser:response,
        }, {
            status: 200
        });
    } catch (error) {
        console.log("Failed to search user:", error);
        return Response.json({
            success: false,
            message: "Failed to search user",
        }, {
            status: 500,
        });
    }
}
