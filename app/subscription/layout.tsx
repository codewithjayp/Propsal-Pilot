import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";

export default async function SubscriptionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Await is required for cookies() in newer Next.js versions
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Components can only read cookies, not set them.
            // This catch block safely ignores the Next.js error if Supabase 
            // attempts to refresh the session token during a page render.
          }
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // Instantly route them away before the page renders
    redirect("/login-test?redirect=/subscription");
  }

  return <>{children}</>;
}