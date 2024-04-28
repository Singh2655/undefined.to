import dbConnect from "@/lib/dbConnect";
import Image from "next/image";

export default async function Home() {
  await dbConnect()
  return (
    <div className="">
      nothing to show...
    </div>
  );
}
