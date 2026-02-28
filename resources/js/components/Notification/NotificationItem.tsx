import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Bell, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { Notification } from '@/types';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead?: (id: number) => void;
}

export function NotificationItem({ notification, onMarkAsRead }: NotificationItemProps) {
  const isRead = !!notification.read_at;

  const getTypeColor = (type: string) => {
    // Generic type colors
    if (type.includes('overdue') || type.includes('error')) {
      return 'bg-red-500/10 text-red-500';
    }
    if (type.includes('due') || type.includes('warning')) {
      return 'bg-yellow-500/10 text-yellow-500';
    }
    if (type.includes('success')) {
      return 'bg-green-500/10 text-green-500';
    }
    return 'bg-blue-500/10 text-blue-500';
  };

  const getTypeLabel = (type: string) => {
    // Convert snake_case to Title Case
    return type
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <Card className={`${isRead ? 'opacity-60' : 'border-primary/20'}`}>
      <CardContent className="flex items-start gap-4 p-4">
        <div className={`mt-1 rounded-full p-2 ${getTypeColor(notification.type)}`}>
          <Bell className="h-4 w-4" />
        </div>

        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-semibold">{notification.title}</h4>
            {!isRead && <Badge variant="default" className="h-2 w-2 rounded-full p-0" />}
          </div>

          <p className="text-sm text-muted-foreground">{notification.message}</p>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className={getTypeColor(notification.type)}>
              {getTypeLabel(notification.type)}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(notification.created_at), {
                addSuffix: true,
                locale: vi,
              })}
            </span>
          </div>
        </div>

        {!isRead && onMarkAsRead && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onMarkAsRead(notification.id)}
            className="shrink-0"
          >
            <Check className="h-4 w-4" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
