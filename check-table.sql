-- Check if video_url column exists in guidelines_articles table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'guidelines_articles' 
AND table_schema = 'public'
ORDER BY ordinal_position;
