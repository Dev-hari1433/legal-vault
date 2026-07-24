import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { DashboardSidebar } from '@/components/dashboard-sidebar';
import { DashboardHeader } from '@/components/dashboard-header';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  let profile = null;
  let userEmail = 'demo@legacyvault.com';
  let avatarUrl = undefined;

  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      userEmail = user.email || userEmail;
      avatarUrl = user.user_metadata?.avatar_url;
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('full_name, email, avatar_url')
        .eq('id', user.id)
        .maybeSingle();
      profile = userProfile;
    }
  } catch {
    // Ignore errors when Supabase credentials or session are absent
  }

  const displayName = profile?.full_name || 'Demo User';

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar userName={displayName} />
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader userName={displayName} avatarUrl={profile?.avatar_url || avatarUrl} email={userEmail} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
