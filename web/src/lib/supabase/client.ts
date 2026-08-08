import { createBrowserClient } from "@supabase/ssr";

// Cliente de Supabase para Client Components. No hay código cliente que lo
// use todavía (todo pasa por Server Actions), pero queda el helper estándar
// listo para cuando haga falta.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
