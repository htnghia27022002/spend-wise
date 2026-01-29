import { Head } from '@inertiajs/react';
import { Calendar, Clock, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

interface Overview {
  total_events: number;
  upcoming_payments: number;
  upcoming_subscriptions: number;
  upcoming_installments: number;
  events_by_type: {
    payment_due: any[];
    subscription_due: any[];
    installment_due: any[];
    custom: any[];
    reminder: any[];
  };
}

interface Props {
  overview: Overview;
  startDate: string;
  endDate: string;
}

const typeColors = {
  payment_due: 'bg-red-100 text-red-800',
  subscription_due: 'bg-blue-100 text-blue-800',
  installment_due: 'bg-yellow-100 text-yellow-800',
  custom: 'bg-gray-100 text-gray-800',
  reminder: 'bg-purple-100 text-purple-800',
};

export default function Overview({ overview, startDate, endDate }: Props) {
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Calendar', href: '/calendar' },
    { title: 'Overview', href: '/calendar/overview' },
  ];

  const stats = [
    {
      label: 'Total Events',
      value: overview.total_events,
      icon: Calendar,
      color: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      label: 'Upcoming Payments',
      value: overview.upcoming_payments,
      icon: AlertCircle,
      color: 'bg-red-50 text-red-700 border-red-200',
    },
    {
      label: 'Subscriptions Due',
      value: overview.upcoming_subscriptions,
      icon: Clock,
      color: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      label: 'Installments Due',
      value: overview.upcoming_installments,
      icon: AlertCircle,
      color: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Calendar Overview" />

      <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
        <div>
          <h1 className="text-3xl font-bold">Calendar Overview</h1>
          <p className="text-gray-600 mt-1">
            {startDate} to {endDate}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className={`border ${stat.color}`}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                      <p className="text-3xl font-bold mt-2">{stat.value}</p>
                    </div>
                    <Icon className="h-8 w-8 opacity-50" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Events by Type */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Object.entries(overview.events_by_type).map(([type, events]) => (
            <Card key={type}>
              <CardHeader>
                <CardTitle className="text-lg">
                  {type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {events.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No events</p>
                ) : (
                  <div className="space-y-3">
                    {events.slice(0, 5).map((event, idx) => (
                      <div key={idx} className="rounded-lg border border-gray-200 p-3">
                        <h4 className="font-semibold text-sm truncate">{event.title}</h4>
                        <p className="text-xs text-gray-600 mt-1">
                          {new Date(event.start_date).toLocaleDateString()}
                        </p>
                        <Badge
                          className={`mt-2 text-xs ${
                            typeColors[type as keyof typeof typeColors]
                          }`}
                        >
                          {type.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                    ))}
                    {events.length > 5 && (
                      <p className="text-xs text-gray-500 text-center pt-2">
                        +{events.length - 5} more
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
