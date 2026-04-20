-- Add title column
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS title text NOT NULL DEFAULT '';

-- Add is_read column
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS is_read boolean NOT NULL DEFAULT false;

-- Make user_id nullable for broadcast notifications
ALTER TABLE public.notifications ALTER COLUMN user_id DROP NOT NULL;

-- Drop old RLS policies
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;

-- Users can view their own notifications OR broadcast notifications (user_id IS NULL)
CREATE POLICY "Users can view own or broadcast notifications"
ON public.notifications FOR SELECT TO authenticated
USING (user_id = auth.uid() OR user_id IS NULL);

-- Users can update their own notifications (mark read/unread)
CREATE POLICY "Users can update own notifications"
ON public.notifications FOR UPDATE TO authenticated
USING (user_id = auth.uid() OR user_id IS NULL);

-- Admins can manage all notifications
CREATE POLICY "Admins can manage notifications"
ON public.notifications FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;