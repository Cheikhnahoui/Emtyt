type P = { price: number; discount_price: number | null; stock: number; is_available: boolean };
export const finalPrice = (p: P) => p.discount_price ?? p.price;
export const inStock = (p: P) => p.is_available && p.stock > 0;
export const discountPercent = (p: P) => (p.discount_price != null && p.price > 0 ? Math.round((1 - p.discount_price / p.price) * 100) : 0);
