import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cvxqsvjfvvozdezjrbmq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2eHFzdmpmdnZvemRlempyYm1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3ODY1NzEsImV4cCI6MjA4NzM2MjU3MX0.kOJ2KjwSgm0SA1xaugI_62wGFot6HFxR7HS2rC1lTbs';

export const supabase = createClient(supabaseUrl, supabaseKey);