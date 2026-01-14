import { createFileRoute } from '@tanstack/react-router';
import { ProtectedRoute } from '@/auth/ProtectedRoute';
import { useTelegramTheme } from '@/auth/useTelegram';
import { GenerationsTimeline } from './GenerationsTimeline';
import { ProfileHeader } from './components/ProfileHeader';
import { CommunitySelector } from './components/CommunitySelector';
import { PendingExecutionsWidget } from './components/PendingExecutionsWidget';
import { AuthorizeBotMessages } from './components/AuthorizeBotMessages';

export const Route = createFileRoute('/_main/profile/')({
  component: ProfileLayout,
});

export function ProfileLayout() {
  const { isTelegram } = useTelegramTheme();

  return (
    <ProtectedRoute>
      <div className="profile-layout h-screen">
        {/* This renders the index content when at /profile */}
        <main className="flex h-full flex-col p-6">
          <CommunitySelector />
          <ProfileHeader />
          <PendingExecutionsWidget />
          {isTelegram && (
            <div>
              <AuthorizeBotMessages />
            </div>
          )}

          {/* REMOVED FILTERS AS IT WAS A BIT BUGGED*/}
          {/* Content Type Filters */}
          {/* <div className="border-tg-section-separator border-b pb-3">
            <ProfileFilters
              contentTypes={contentTypes}
              selectedTypes={selectedTypes}
              toggleType={toggleType}
              typeButtonsRef={typeButtonsRef}
            />
          </div> */}

          {/* Timeline with filter */}
          <GenerationsTimeline />
        </main>
      </div>
      <div className="h-20"></div>
    </ProtectedRoute>
  );
}
