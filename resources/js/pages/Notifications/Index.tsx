import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { NotificationItem } from '@/components/Notification';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { BreadcrumbItem } from '@/types';
import type { Notification, PaginatedData } from '@/types/finance';
import { RefreshCw } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Notifications', href: '/notifications' },
];

interface Props {
  notifications: PaginatedData<Notification>;
  unreadCount: number;
  filters?: {
    status?: string;
  };
}

export default function Index({ notifications, unreadCount, filters }: Props) {
  const handleMarkAsRead = (id: number) => {
    router.post(`/notifications/${id}/mark-as-read`, {}, {
      preserveScroll: true,
      onSuccess: () => router.reload({ only: ['notifications', 'unreadCount'] }),
    });
  };

  const handleRetry = (id: number) => {
    router.post(`/notifications/${id}/retry`, {}, {
      preserveScroll: true,
      onSuccess: () => router.reload({ only: ['notifications'] }),
    });
  };

  const handleStatusFilter = (status: string) => {
    router.get('/notifications', { status: status === 'all' ? undefined : status }, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  const getStatusBadgeVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'sent':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'sending':
        return 'outline';
      case 'failed':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Notifications" />

      <div className="flex h-full flex-1 flex-col gap-4 p-4 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-sm text-muted-foreground">{unreadCount} unread</p>
            )}
          </div>

          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <Select
              value={filters?.status || 'all'}
              onValueChange={handleStatusFilter}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="sending">Sending</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>

            <Button asChild>
              <Link href="/notifications/settings">Settings</Link>
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {notifications.data.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No notifications found</p>
          ) : (
            notifications.data.map((notif) => (
              <div key={notif.id} className="rounded-lg border p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{notif.title}</h3>
                      <Badge variant={getStatusBadgeVariant(notif.status || 'sent')}>
                        {notif.status || 'sent'}
                      </Badge>
                      {!notif.read_at && (
                        <Badge variant="outline">Unread</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{notif.message}</p>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span>{new Date(notif.created_at).toLocaleString()}</span>
                      {notif.channel && (
                        <>
                          <span>•</span>
                          <Badge variant="secondary" className="text-xs">
                            {notif.channel}
                          </Badge>
                        </>
                      )}
                      {notif.status === 'failed' && notif.retry_count !== undefined && (
                        <>
                          <span>•</span>
                          <span>Retry {notif.retry_count}/{notif.max_retries || 3}</span>
                        </>
                      )}
                    </div>
                    {notif.last_error && (
                      <div className="mt-2 rounded-md bg-destructive/10 p-2 text-xs text-destructive">
                        Error: {notif.last_error}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {!notif.read_at && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMarkAsRead(notif.id)}
                      >
                        Mark as Read
                      </Button>
                    )}
                    {notif.status === 'failed' && (notif.retry_count || 0) < (notif.max_retries || 3) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRetry(notif.id)}
                      >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Retry
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
}

