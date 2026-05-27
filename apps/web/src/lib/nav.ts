/** Главная — только index `/dashboard`, не все дочерние роуты. */
export function isNavActive(pathname: string, to: string): boolean {
  const normalized = pathname.replace(/\/$/, "") || "/";

  if (to === "/dashboard") {
    return normalized === "/dashboard";
  }

  return normalized === to || normalized.startsWith(`${to}/`);
}
