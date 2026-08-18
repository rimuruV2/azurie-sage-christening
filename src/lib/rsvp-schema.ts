import { z } from "zod";

export const rsvpSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(1, { message: "Please tell us your name" })
      .max(100, { message: "Name must be under 100 characters" }),
    email: z
      .string()
      .trim()
      .email({ message: "Please enter a valid email" })
      .max(255, { message: "Email must be under 255 characters" }),
    attending: z.boolean(),
    guestCount: z.coerce
      .number()
      .int({ message: "Guest count must be a whole number" })
      .min(0)
      .max(10, { message: "Please contact us directly for parties over 10" }),
  })
  .transform((value) => ({
    ...value,
    guestCount: value.attending ? value.guestCount : 0,
  }));

export type RsvpInput = z.input<typeof rsvpSchema>;
