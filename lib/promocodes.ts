// Промокоды FederalStore.
// Сейчас активен: FEDERAL — скидка 20% на любой товар.
// В систему заказов новые коды добавляются здесь же и работают сразу.

export type PromoCode = {
  code: string;
  discountPercent: number; // целое число процентов (20 = -20%)
  active: boolean;
};

export const PROMO_CODES: PromoCode[] = [
  {
    code: 'FEDERAL',
    discountPercent: 20,
    active: true,
  },
];

// Возвращает промокод по строке (без учёта регистра и лишних пробелов).
export function findPromo(raw: string | null | undefined): PromoCode | null {
  if (!raw) return null;
  const code = raw.trim().toUpperCase();
  return PROMO_CODES.find((p) => p.code === code && p.active) || null;
}

// Цена со скидкой, округлённая вниз до целого рубля (без копеек).
export function applyPromo(price: number, promo: PromoCode | null): number {
  if (!promo) return price;
  const discounted = price * (1 - promo.discountPercent / 100);
  return Math.max(1, Math.floor(discounted));
}