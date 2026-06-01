
CREATE TABLE public.public_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL DEFAULT 'Untitled template',
  canvas_w INTEGER NOT NULL DEFAULT 1920,
  canvas_h INTEGER NOT NULL DEFAULT 1080,
  pages JSONB NOT NULL DEFAULT '[]'::jsonb,
  thumbnail TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT ON public.public_templates TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.public_templates TO authenticated;
GRANT ALL ON public.public_templates TO service_role;

ALTER TABLE public.public_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view public templates"
  ON public.public_templates FOR SELECT
  USING (true);

CREATE POLICY "Users can publish their own templates"
  ON public.public_templates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own templates"
  ON public.public_templates FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own templates"
  ON public.public_templates FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER set_public_templates_updated_at
  BEFORE UPDATE ON public.public_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_updated_at();

CREATE INDEX public_templates_created_at_idx ON public.public_templates (created_at DESC);
