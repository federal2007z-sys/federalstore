import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { isAdminUser } from '@/lib/isAdmin';
import { products, formatPrice } from '@/lib/products';
import AdminOrders from '@/components/admin/AdminOrders';
import AdminUsers from '@/components/admin/AdminUsers';
import type { Order } from '@/lib/types';

export const dynamic = 'force-dynamic';

const titleMap = Object.fromEntries(products.map((p) => [p.id, p.title]));

export default async function AdminPage() {
  const isAdmin = await isAdminUser();
  if (!isAdmin) {
    return (
      <div className="container">
        <div className="empty-state">
          <h1>Доступ запрещён</h1>
          <p>Эта страница только для администратора.</p>
          <p><Link href="/">На главную</Link></p>
        </div>
      </div>
    );
  }

  const supabase = createClient();
  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  const { data: userProfiles } = await supabase
    .from('profiles')
    .select('id, full_name, nickname, prefix, role, banned_at, created_at')
    .order('created_at', { ascending: false })
    .limit(200);

  return (
    <div className="container">
      <h1 style={{ fontSize: '1.8rem', margin: '30px 0 20px' }}>Админ-панель</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
        Подтверждайте оплату, чтобы открыть покупателю доступ к скачиванию файлов.
      </p>

      <h2 style={{ fontSize: '1.3rem', margin: '30px 0 14px' }}>🛒 Заказы</h2>
      <AdminOrders orders={(orders || []) as Order[]} titleMap={titleMap} />

      <h2 style={{ fontSize: '1.3rem', margin: '40px 0 14px' }}>👥 Участники</h2>
      <AdminUsers users={(userProfiles || []) as never[]} />
    </div>
  );
}