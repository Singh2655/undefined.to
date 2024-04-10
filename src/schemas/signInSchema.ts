import { z } from "zod";

export const signUpSchema=z.object({
    identifier:z.string(),
    password:z.string().min(8,{message:"password must be 8 characters long"})
  })