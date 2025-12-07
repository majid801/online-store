
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_PROJECT_URL, SUPABASE_PUBLISHABLE_KEY } from '../constants';

export const supabase = createClient(SUPABASE_PROJECT_URL, SUPABASE_PUBLISHABLE_KEY);

// Helper to get current user profile with role
export const getCurrentProfile = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
    
  return profile;
};
