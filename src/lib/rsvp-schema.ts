import { z } from "zod";

export const rsvpSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(1, { message: "Please tell us your name" })
      .max(100, { message: "Name must be under 100 characters" }),
    phone: z
      .string()
      .trim()
      .min(7, { message: "Please enter a valid phone number" })
      .max(30, { message: "Phone number must be under 30 characters" })
      .regex(/^[0-9+()\-\s]+$/, { message: "Please enter a valid phone number" }),
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
