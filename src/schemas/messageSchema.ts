import { z } from "zod";

export const messageSchema = z.object({
  content: z.string().min(1, { message: "Message must be of 1 character." }).max(200, { message: "Message must be no more than 200 characters long." }),
});
