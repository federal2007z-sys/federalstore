import { createClient } from '@/lib/supabase/server';

// Проверка, является ли текущий пользователь админом (по email, заданному в SQL-миграции)
export async function isAdminUser(): Promise<boolean> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  const { data } = await supabase.rpc('is_admin');
  return data === true;
}