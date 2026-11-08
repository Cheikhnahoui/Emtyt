/** Lets the owner log in with a simple username (no real email needed).
 *  "owner" becomes "owner@example.com" internally; example.com is a reserved domain, so no mail can ever go anywhere.
 *  If the person types a full email address, it is used as-is. */
export const LOGIN_DOMAIN = "example.com";

export const toLoginEmail = (input: string) => {
  const v = input.trim().toLowerCase();
  return v.includes("@") ? v : `${v}@${LOGIN_DOMAIN}`;
};

export const toDisplayName = (email?: string | null) =>
  email?.endsWith(`@${LOGIN_DOMAIN}`) ? email.slice(0, -(LOGIN_DOMAIN.length + 1)) : email ?? "";