/** Platform fee per booking, in euros (fixed amount). */
export const PLATFORM_FEE_EUR = 5

/** Platform fee in cents for calculations. */
export const PLATFORM_FEE_CENTS = PLATFORM_FEE_EUR * 100

/**
 * What the business receives (in cents) when customer pays `customerPriceCents`.
 * Customer pays customerPriceCents; we take PLATFORM_FEE_CENTS; business gets the rest.
 */
export function businessReceivesCents(customerPriceCents: number): number {
  return Math.max(0, customerPriceCents - PLATFORM_FEE_CENTS)
}

export function formatEur(cents: number): string {
  return new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' }).format(cents / 100)
}
