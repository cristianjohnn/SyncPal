import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    // Create the redirect response first so cookies can be set on it
    const forwardedHost = request.headers.get("x-forwarded-host");
    const isLocalEnv = process.env.NODE_ENV === "development";
    const redirectBase =
      forwardedHost && !isLocalEnv
        ? `https://${forwardedHost}`
        : origin;

    const redirectUrl = `${redirectBase}${next}`;
    const response = NextResponse.redirect(redirectUrl);

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    console.log("[Callback] exchangeCodeForSession:", {
      success: !error,
      userId: data?.user?.id ?? "none",
      error: error?.message ?? "none",
    });

    if (!error && data.user) {
      // Upsert user profile on first login
      const { data: upsertResult, error: upsertError } = await supabase
        .from("users")
        .upsert(
          {
            id: data.user.id,
            full_name:
              data.user.user_metadata.full_name ||
              data.user.user_metadata.name ||
              data.user.email?.split("@")[0] ||
              "User",
            email: data.user.email!,
            role: "user",
            avatar_url: data.user.user_metadata.avatar_url || null,
          },
          { onConflict: "id" }
        )
        .select("id")
        .single();

      console.log("[Callback] profile upsert:", {
        success: !!upsertResult,
        error: upsertError?.message ?? "none",
      });

      // Log cookies being set on the response
      const responseCookies = response.cookies.getAll();
      console.log("[Callback] Response cookies being sent:", responseCookies.map(c => c.name));

      return response;
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
}
