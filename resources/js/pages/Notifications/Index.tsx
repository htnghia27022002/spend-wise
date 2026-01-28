import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { NotificationItem } from '@/components/Notification';
import type { BreadcrumbItem } from '@/types';
import type { Notification, PaginatedData } from '@/types/finance';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Finance', href: '/finance/dashboard' },
  { title: 'Notifications', href: '/notifications' },
];

interface Props {
  notifications: PaginatedData<Notification>;
  unreadCount: number;
}

export default function Index({ notifications, unreadCount }: Props) {
  const handleMarkAsRead = (id: number) => {
    // TODO: Implement mark as read
    console.log('Mark as read:', id);
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Notifications" />

      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Notifications</h1>
            {unreadCount > 0 && <p className="text-sm text-muted-foreground">{unreadCount} unread</p>}
          </div>
          <Button asChild>
            <Link href="/notifications/settings">Settings</Link>
          </Button>
        </div>

        <div className="space-y-4">
          {notifications.data.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No notifications yet</p>
          ) : (
            notifications.data.map((notif) => (
              <NotificationItem 
                key={notif.id} 
                notification={notif} 
                onMarkAsRead={handleMarkAsRead}
              />
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
}
