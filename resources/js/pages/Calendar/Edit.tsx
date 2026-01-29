import { Head, useForm } from '@inertiajs/react';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'pink', 'gray'];
const types = ['custom', 'payment_due', 'subscription_due', 'installment_due', 'reminder'];
const reminderTypes = ['notification', 'email', 'sms'];

interface CalendarEvent {
  id: number;
  title: string;
  description?: string;
  start_date: string;
  end_date?: string;
  type: string;
  color: string;
  is_all_day: boolean;
  location?: string;
  reminders?: Array<{
    id: number;
    minutes_before: number;
    reminder_type: string;
  }>;
}

interface Props {
  event: CalendarEvent;
}

export default function Edit({ event }: Props) {
  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Calendar', href: '/calendar' },
    { title: event.title, href: `/calendar/${event.id}` },
    { title: 'Edit', href: `/calendar/${event.id}/edit` },
  ];

  const { data, setData, put, delete: destroy, processing, errors } = useForm({
    title: event.title,
    description: event.description || '',
    start_date: event.start_date,
    end_date: event.end_date || '',
    type: event.type,
    color: event.color,
    is_all_day: event.is_all_day,
    location: event.location || '',
    reminders: event.reminders || [],
  });

  const [reminderMinutes, setReminderMinutes] = useState('15');
  const [reminderType, setReminderType] = useState('notification');

  const handleAddReminder = () => {
    if (reminderMinutes && reminderType) {
      setData('reminders', [
        ...data.reminders,
        {
          minutes_before: parseInt(reminderMinutes),
          reminder_type: reminderType,
        } as any,
      ]);
      setReminderMinutes('15');
      setReminderType('notification');
    }
  };

  const handleRemoveReminder = (index: number) => {
    setData(
      'reminders',
      data.reminders.filter((_, i) => i !== index)
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(`/calendar/${event.id}`);
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this event?')) {
      destroy(`/calendar/${event.id}`);
    }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Edit ${event.title}`} />

      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <Card className="mx-auto w-full max-w-2xl">
          <CardHeader>
            <CardTitle>Edit Event</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Event Title *</Label>
                <Input
                  id="title"
                  value={data.title}
                  onChange={(e) => setData('title', e.target.value)}
                  required
                />
                {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={data.description}
                  onChange={(e) => setData('description', e.target.value)}
                />
              </div>

              {/* Type and Color */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="type">Event Type *</Label>
                  <Select value={data.type} onValueChange={(value) => setData('type', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {types.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t.replace(/_/g, ' ').toUpperCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="color">Color *</Label>
                  <Select value={data.color} onValueChange={(value) => setData('color', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {colors.map((c) => (
                        <SelectItem key={c} value={c}>
                          <div className="flex items-center gap-2">
                            <div
                              className="h-3 w-3 rounded-full"
                              style={{ backgroundColor: c }}
                            />
                            {c.charAt(0).toUpperCase() + c.slice(1)}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* All Day */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Checkbox
                    checked={data.is_all_day}
                    onCheckedChange={(checked) => setData('is_all_day', checked === true)}
                  />
                  All Day Event
                </Label>
              </div>

              {/* Dates */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="start_date">
                    {data.is_all_day ? 'Date' : 'Start Date & Time'} *
                  </Label>
                  <Input
                    id="start_date"
                    type={data.is_all_day ? 'date' : 'datetime-local'}
                    value={data.start_date}
                    onChange={(e) => setData('start_date', e.target.value)}
                    required
                  />
                </div>

                {!data.is_all_day && (
                  <div className="space-y-2">
                    <Label htmlFor="end_date">End Date & Time</Label>
                    <Input
                      id="end_date"
                      type="datetime-local"
                      value={data.end_date}
                      onChange={(e) => setData('end_date', e.target.value)}
                    />
                  </div>
                )}
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={data.location}
                  onChange={(e) => setData('location', e.target.value)}
                />
              </div>

              {/* Reminders */}
              <div className="space-y-4 rounded-lg border border-gray-200 p-4">
                <h3 className="font-semibold">Reminders</h3>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="reminder_minutes">Minutes Before</Label>
                    <Input
                      id="reminder_minutes"
                      type="number"
                      value={reminderMinutes}
                      onChange={(e) => setReminderMinutes(e.target.value)}
                      min="5"
                      step="5"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reminder_type">Type</Label>
                    <Select value={reminderType} onValueChange={setReminderType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {reminderTypes.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t.charAt(0).toUpperCase() + t.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddReminder}
                      className="w-full"
                    >
                      Add
                    </Button>
                  </div>
                </div>

                {/* Reminders List */}
                {data.reminders.length > 0 && (
                  <div className="space-y-2">
                    {data.reminders.map((reminder, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-lg bg-gray-100 p-3"
                      >
                        <span className="text-sm">
                          {reminder.minutes_before} min via {reminder.reminder_type}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveReminder(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={processing}>
                  {processing ? 'Updating...' : 'Update Event'}
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={processing}
                >
                  Delete
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => window.history.back()}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
