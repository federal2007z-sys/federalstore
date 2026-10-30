import ProductsCatalog, { type SortKey } from '@/components/ProductsCatalog';

export default function ProductsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const q = typeof searchParams.q === 'string' ? searchParams.q : '';
  const game = typeof searchParams.game === 'string' ? searchParams.game : 'all';
  const maxRaw = typeof searchParams.max === 'string' ? Number(searchParams.max) : NaN;
  const max = Number.isNaN(maxRaw) || maxRaw <= 0 ? 600 : maxRaw;
  const rawSort = typeof searchParams.sort === 'string' ? searchParams.sort : 'default';
  const sort: SortKey = rawSort === 'price-asc' || rawSort === 'price-desc' ? rawSort : 'default';

  return (
    <ProductsCatalog
      initialQuery={q}
      initialGame={game}
      initialMax={max}
      initialSort={sort}
    />
  );
}