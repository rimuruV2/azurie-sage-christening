ALTER TABLE public.rsvps DROP CONSTRAINT rsvps_email_format;
ALTER TABLE public.rsvps DROP CONSTRAINT rsvps_email_len;
ALTER TABLE public.rsvps RENAME COLUMN email TO phone;
ALTER TABLE public.rsvps ADD CONSTRAINT rsvps_phone_len CHECK (char_length(trim(phone)) >= 7 AND char_length(trim(phone)) <= 30);
ALTER TABLE public.rsvps ADD CONSTRAINT rsvps_phone_format CHECK (phone ~ '^[0-9+()\-\s]+$');