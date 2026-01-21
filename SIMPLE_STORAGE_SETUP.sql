-- Simple storage bucket creation (run as admin)
-- If this fails, use the Dashboard method instead

INSERT INTO storage.buckets (id, name, public)
VALUES ('branding-assets', 'branding-assets', true)
ON CONFLICT (id) DO NOTHING;
