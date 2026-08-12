import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const ADMIN_LOGIN_PATH = "/admin/login";
// El link de "cambiar contraseña" por email vuelve acá con un ?code= antes
// de que exista sesión (puede abrirse en un navegador sin sesión activa) —
// tiene que quedar afuera del gate de login igual que /admin/login, si no el
// proxy lo rebota antes de que la página pueda canjear el code.
const ADMIN_RECOVERY_PATH = "/admin/actualizar-contrasena";

// Capa 1 de 3 (ver web/src/lib/data/auth.ts para la capa 2, y las políticas
// RLS en supabase/migrations/ para la capa 3, que es la que de verdad no se
// puede saltar). Esto es solo una redirección optimista: refresca la sesión
// y saca de /admin a quien no esté logueado. No reemplaza verifyAdminSession().
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isLoginPath = pathname === ADMIN_LOGIN_PATH;
  const isRecoveryPath = pathname === ADMIN_RECOVERY_PATH;
  const isAdminPath = pathname.startsWith("/admin");

  if (isAdminPath && !isLoginPath && !isRecoveryPath && !user) {
    const url = request.nextUrl.clone();
    url.pathname = ADMIN_LOGIN_PATH;
    return NextResponse.redirect(url);
  }

  if (isLoginPath && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

  return response;
}
