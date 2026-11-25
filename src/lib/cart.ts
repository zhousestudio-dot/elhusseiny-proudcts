export interface CartItem {
  id: string;
  slug: string;
  name: string;
  /** Display price only — server always recalculates real prices from Supabase at checkout */
  price: number;
  image_url: string;
  quantity: number;
}

const CART_STORAGE_KEY = "elhusseiny_cart_v1";

/** Reads cart items safely from localStorage. */
export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is CartItem =>
        Boolean(item?.id) &&
        typeof item.quantity === "number" &&
        item.quantity > 0
    );
  } catch {
    return [];
  }
}

/** Saves cart items to localStorage and updates header badge. */
function saveCart(items: CartItem[]): void {
  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  syncCartBadge(items);
}

/** Adds a product (or increments its quantity) in the cart. */
export function addToCart(item: Omit<CartItem, "quantity">, qty = 1): CartItem[] {
  const items = getCart();
  const existing = items.find((i) => i.id === item.id);

  if (existing) {
    existing.quantity += qty;
  } else {
    items.push({ ...item, quantity: qty });
  }

  saveCart(items);
  return items;
}

/** Updates an item's quantity; removes the item if quantity <= 0. */
export function updateQuantity(productId: string, quantity: number): CartItem[] {
  const items = getCart()
    .map((item) =>
      item.id === productId ? { ...item, quantity: Math.floor(quantity) } : item
    )
    .filter((item) => item.quantity > 0);

  saveCart(items);
  return items;
}

/** Removes an item completely from the cart. */
export function removeFromCart(productId: string): CartItem[] {
  const items = getCart().filter((item) => item.id !== productId);
  saveCart(items);
  return items;
}

/** Clears all items from the cart. */
export function clearCart(): void {
  saveCart([]);
}

/** Returns total number of units in the cart. */
export function getCartCount(items: CartItem[] = getCart()): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

/** Returns display subtotal in EGP (for UI preview only). */
export function getCartTotalEGP(items: CartItem[] = getCart()): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

/** Updates the #cart-count badge in the header. */
export function syncCartBadge(items: CartItem[] = getCart()): void {
  const badge = document.getElementById("cart-count");
  if (badge) {
    badge.textContent = String(getCartCount(items));
  }
}
