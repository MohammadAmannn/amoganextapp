-- Create the short_urls table
CREATE TABLE IF NOT EXISTS public.short_urls (
    id text PRIMARY KEY,
    target_url text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.short_urls ENABLE ROW LEVEL SECURITY;

-- Allow anonymous select access (anyone can resolve a redirect)
CREATE POLICY "Allow public read access" ON public.short_urls
    FOR SELECT USING (true);

-- Allow anonymous insert access (anyone can create a shortened link)
CREATE POLICY "Allow public insert access" ON public.short_urls
    FOR INSERT WITH CHECK (true);
