-- ================================================================================
-- PDF PROCESSING PIPELINE MIGRATION SCRIPT
-- ================================================================================
-- File: supabase_migration.sql
-- Description: Adds columns and indexes to the public.chat_messages table
--              to support the asynchronous PDF processing pipeline.
--
-- Instructions: Run this script inside your Supabase Dashboard SQL Editor
--               (https://supabase.com/dashboard/project/_/sql).
-- ================================================================================

-- 1. Add file_content_text column (if it doesn't exist)
ALTER TABLE public.chat_messages 
ADD COLUMN IF NOT EXISTS file_content_text TEXT;

-- 2. Add file_content_json column (if it doesn't exist)
ALTER TABLE public.chat_messages 
ADD COLUMN IF NOT EXISTS file_content_json JSONB;

-- 3. Add processing_status column (if it doesn't exist)
ALTER TABLE public.chat_messages 
ADD COLUMN IF NOT EXISTS processing_status TEXT DEFAULT NULL;

-- 4. Create an index to quickly filter and query messages by processing status
CREATE INDEX IF NOT EXISTS idx_chat_messages_processing_status 
ON public.chat_messages (processing_status) 
WHERE processing_status IS NOT NULL;

-- ================================================================================
-- END OF MIGRATION
-- ================================================================================
