import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Edit, Trash2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface CalendarEvent {
  id: number;
  title: string;
  description?: string;
  start_date: string;
  end_date?: string;
  type: 'payment_due' | 'subscription_due' | 'installment_due' | 'custom' | 'reminder';
  color: string;
  is_all_day: boolean;
  location?: string;
  metadata?: any;
  reminders?: Array<{
    id: number;
    minutes_before: number;
    reminder_type: string;
    is_active: boolean;
  }>;
}

interface Props {
  event: CalendarEvent;
}

const typeLabels = {
  payment_due: 'Payment Due',
  subscription_due: 'Subscription Due',
  installment_due: 'Installment Due',
  custom: 'Custom Event',
  reminder: 'Reminder',
};

const typeColors = {
  payment_due: 'bg-red-100 text-red-800',
  subscription_due: 'bg-blue-100 text-blue-800',
  installment_due: 'bg-yellow-100 text-yellow-800',
  custom: 'bg-gray-100 text-gray-800',
  reminder: 'bg-purple-100 text-purple-800',
};

export default function Show({ event }: Props) {
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Calendar', href: '/calendar' },
    { title: event.title, href: `/calendar/${event.id}` },
  ];

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: event.is_all_day ? undefined : '2-digit',
      minute: event.is_all_day ? undefined : '2-digit',
    });
  };

  const getReminderLabel = (minutes: number) => {
    if (minutes < 60) return `${minutes} minutes`;
    if (minutes === 60) return '1 hour';
    if (minutes === 1440) return '1 day';
    if (minutes < 1440) return `${Math.floor(minutes / 60)} hours`;
    return `${Math.floor(minutes / 1440)} days`;
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={event.title} />

      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <div className="flex items-center justify-between">
          <Link href="/calendar">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Calendar
            </Button>
          </Link>
          <div className="flex gap-2">
            <Link href={`/calendar/${event.id}/edit`}>
              <Button>
                <Edit className="mr-2 h-4 w-4" />
                Edit Event
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl">{event.title}</CardTitle>
                  <Badge
                    className={`mt-3 ${typeColors[event.type as keyof typeof typeColors]}`}
                  >
                    {typeLabels[event.type as keyof typeof typeLabels]}
                  </Badge>
                </div>
                <div
                  className="h-6 w-6 rounded-full"
                  style={{ backgroundColor: event.color }}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Description */}
              {event.description && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 mb-2">Description</h3>
                  <p className="text-gray-700">{event.description}</p>
                </div>
              )}

              {/* Date & Time */}
              <div>
                <h3 className="text-sm font-semibold text-gray-600 mb-2">Date & Time</h3>
                <div className="space-y-1">
                  <p className="text-gray-700 font-medium">{formatDate(event.start_date)}</p>
                  {event.end_date && !event.is_all_day && (
                    <p className="text-sm text-gray-600">
                      to {formatDate(event.end_date)}
                    </p>
                  )}
                  {event.is_all_day && (
                    <p className="text-sm text-gray-600">All day event</p>
                  )}
                </div>
              </div>

              {/* Location */}
              {event.location && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 mb-2">Location</h3>
                  <p className="text-gray-700">{event.location}</p>
                </div>
              )}

              {/* Metadata */}
              {event.metadata && event.metadata.linkedType && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 mb-2">Linked To</h3>
                  <div className="rounded-lg bg-gray-50 p-3">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">{event.metadata.linkedType}:</span> #{event.metadata.linkedId}
                    </p>
                    {event.metadata.amount && (
                      <p className="text-sm text-gray-700 mt-1">
                        <span className="font-medium">Amount:</span> {event.metadata.amount}
                      </p>
                    )}
                    {event.metadata.status && (
                      <p className="text-sm text-gray-700 mt-1">
                        <span className="font-medium">Status:</span> {event.metadata.status}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Reminders Sidebar */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Reminders
              </CardTitle>
            </CardHeader>
            <CardContent>
              {event.reminders && event.reminders.length > 0 ? (
                <div className="space-y-3">
                  {event.reminders.map((reminder) => (
                    <div
                      key={reminder.id}
                      className={`rounded-lg border p-3 ${
                        reminder.is_active
                          ? 'border-green-200 bg-green-50'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="text-sm">
                        <p className="font-semibold text-gray-900">
                          {getReminderLabel(reminder.minutes_before)}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          via {reminder.reminder_type}
                        </p>
                        <Badge
                          variant="outline"
                          className="mt-2 text-xs"
                        >
                          {reminder.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  No reminders set
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
