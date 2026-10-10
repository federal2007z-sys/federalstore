import { createClient } from '@/lib/supabase/server';

// Проверка, является ли текущий пользователь админом или владельцем.
// Роль хранится в таблице profiles (role: admin/owner).
export async function isAdminUser(): Promise<boolean> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  try {
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    return data?.role === 'admin' || data?.role === 'owner';
  } catch {
    return false;
  }
}