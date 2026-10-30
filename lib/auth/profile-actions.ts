'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function updateAccent(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const accent = String(formData.get('accent') || '').trim();
  const bg = String(formData.get('bg') || '').trim();
  if (!accent.startsWith('#')) return;

  const { error } = await supabase
    .from('profiles')
    .update({ accent_color: accent, bg_color: bg.startsWith('#') ? bg : undefined })
    .eq('id', user.id);

  if (error) {
    redirect(`/account/profile?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath('/account/profile');
  revalidatePath('/');
}

export async function updateProfile(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const nickname = String(formData.get('nickname') || '').trim();
  const prefix = String(formData.get('prefix') || '').trim();
  const avatarFile = formData.get('avatar') as File | null;

  const updates: Record<string, string | null> = {};
  updates.nickname = nickname || null;
  updates.prefix = prefix || null;

  if (avatarFile && avatarFile.size > 0) {
    const ext = avatarFile.name.split('.').pop() || 'png';
    const path = `${user.id}/avatar.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, avatarFile, { upsert: true, contentType: avatarFile.type });
    if (!uploadError) {
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(path);
      updates.avatar_url = urlData.publicUrl;
    }
  }

  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id);

  if (error) {
    redirect(`/account/profile?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath('/account');
  revalidatePath('/account/profile');
  redirect('/account/profile?ok=1');
}