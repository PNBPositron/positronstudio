CREATE TABLE public.template_likes (
  template_id uuid NOT NULL REFERENCES public.public_templates(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (template_id, user_id)
);

CREATE INDEX idx_template_likes_template ON public.template_likes(template_id);
CREATE INDEX idx_template_likes_user ON public.template_likes(user_id);

GRANT SELECT ON public.template_likes TO anon;
GRANT SELECT, INSERT, DELETE ON public.template_likes TO authenticated;
GRANT ALL ON public.template_likes TO service_role;

ALTER TABLE public.template_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Likes are viewable by everyone"
  ON public.template_likes FOR SELECT
  USING (true);

CREATE POLICY "Users can like as themselves"
  ON public.template_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own like"
  ON public.template_likes FOR DELETE
  USING (auth.uid() = user_id);