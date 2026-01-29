import { useForm } from '@inertiajs/react';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
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

const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'pink', 'gray'];
const types = ['custom', 'payment_due', 'subscription_due', 'installment_due', 'reminder'];
const reminderTypes = ['notification', 'email', 'sms'];

interface CalendarEventFormProps {
  initialDate?: string;
  onClose?: () => void;
}

export function CalendarEventForm({ initialDate = '', onClose }: CalendarEventFormProps) {
  const { data, setData, post, processing, errors } = useForm({
    title: '',
    description: '',
    start_date: initialDate || '',
    end_date: '',
    type: 'custom',
    color: 'blue',
    is_all_day: true,
    location: '',
    reminders: [] as Array<{ minutes_before: number; reminder_type: string }>,
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
        },
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
    
    // Validate required fields
    if (!data.title) {
      alert('Vui lòng nhập tiêu đề sự kiện');
      return;
    }
    
    if (!data.start_date) {
      alert('Vui lòng chọn ngày bắt đầu');
      return;
    }
    
    post('/calendar', {
      onSuccess: () => {
        onClose?.();
        window.location.reload();
      },
      onError: (errors) => {
        // Display all errors
        const errorMessages = Object.values(errors).flat().join('\n');
        alert('Có lỗi xảy ra:\n\n' + errorMessages);
      },
      preserveState: true,
      preserveScroll: true,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Global Error Alert */}
      {Object.keys(errors).length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <h4 className="text-sm font-semibold text-red-800 mb-2">Có lỗi xảy ra:</h4>
          <ul className="list-disc list-inside space-y-1">
            {Object.entries(errors).map(([field, messages]) => (
              <li key={field} className="text-xs text-red-700">
                {Array.isArray(messages) ? messages.join(', ') : messages}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Title */}
      <div>
        <Label htmlFor="title" className="text-sm font-medium">
          Tiêu đề <span className="text-red-500">*</span>
        </Label>
        <Input
          id="title"
          type="text"
          placeholder="Nhập tiêu đề sự kiện"
          value={data.title}
          onChange={(e) => setData('title', e.target.value)}
          disabled={processing}
          className={`mt-1 ${errors.title ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
        />
        {errors.title && (
          <p className="mt-1 text-xs text-red-600 font-medium flex items-center gap-1">
            <span>⚠</span> {errors.title}
          </p>
        )}
      </div>

      {/* Description */}
      <div>
        <Label htmlFor="description" className="text-sm font-medium">
          Mô tả
        </Label>
        <Textarea
          id="description"
          placeholder="Nhập mô tả sự kiện"
          value={data.description}
          onChange={(e) => setData('description', e.target.value)}
          disabled={processing}
          className="mt-1"
        />
        {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description}</p>}
      </div>

      {/* Date/Time */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="start_date" className="text-sm font-medium">
            Ngày bắt đầu <span className="text-red-500">*</span>
          </Label>
          <Input
            id="start_date"
            type="datetime-local"
            value={data.start_date}
            onChange={(e) => setData('start_date', e.target.value)}
            disabled={processing}
            className={`mt-1 ${errors.start_date ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
          />
          {errors.start_date && (
            <p className="mt-1 text-xs text-red-600 font-medium flex items-center gap-1">
              <span>⚠</span> {errors.start_date}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="end_date" className="text-sm font-medium">
            Ngày kết thúc
          </Label>
          <Input
            id="end_date"
            type="datetime-local"
            value={data.end_date}
            onChange={(e) => setData('end_date', e.target.value)}
            disabled={processing}
            className="mt-1"
          />
          {errors.end_date && <p className="mt-1 text-xs text-red-500">{errors.end_date}</p>}
        </div>
      </div>

      {/* All day toggle */}
      <div className="flex items-center gap-2">
        <Checkbox
          id="is_all_day"
          checked={data.is_all_day}
          onCheckedChange={(checked) => setData('is_all_day', checked as boolean)}
          disabled={processing}
        />
        <Label htmlFor="is_all_day" className="text-sm font-medium cursor-pointer">
          Sự kiện cả ngày
        </Label>
      </div>

      {/* Type & Color */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="type" className="text-sm font-medium">
            Loại <span className="text-red-500">*</span>
          </Label>
          <Select value={data.type} onValueChange={(value) => setData('type', value)}>
            <SelectTrigger id="type" className="mt-1">
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
          {errors.type && <p className="mt-1 text-xs text-red-500">{errors.type}</p>}
        </div>

        <div>
          <Label htmlFor="color" className="text-sm font-medium">
            Màu sắc <span className="text-red-500">*</span>
          </Label>
          <Select value={data.color} onValueChange={(value) => setData('color', value)}>
            <SelectTrigger id="color" className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {colors.map((c) => (
                <SelectItem key={c} value={c}>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full bg-${c}-500`}
                      style={{
                        backgroundColor: {
                          red: '#ef4444',
                          blue: '#3b82f6',
                          green: '#22c55e',
                          yellow: '#eab308',
                          purple: '#a855f7',
                          pink: '#ec4899',
                          gray: '#6b7280',
                        }[c],
                      }}
                    />
                    {c.toUpperCase()}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.color && <p className="mt-1 text-xs text-red-500">{errors.color}</p>}
        </div>
      </div>

      {/* Location */}
      <div>
        <Label htmlFor="location" className="text-sm font-medium">
          Địa điểm
        </Label>
        <Input
          id="location"
          type="text"
          placeholder="Nhập địa điểm sự kiện"
          value={data.location}
          onChange={(e) => setData('location', e.target.value)}
          disabled={processing}
          className="mt-1"
        />
        {errors.location && <p className="mt-1 text-xs text-red-500">{errors.location}</p>}
      </div>

      {/* Reminders */}
      <div className="border-t pt-4">
        <h3 className="font-semibold text-sm mb-3">Thông báo</h3>
        <div className="space-y-2">
          {data.reminders.map((reminder, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between bg-gray-50 p-2 rounded border"
            >
              <div className="text-sm">
                <span>{reminder.minutes_before} phút trước</span>
                <span className="text-gray-500"> • {reminder.reminder_type}</span>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveReminder(idx)}
                disabled={processing}
                className="text-red-500 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-3 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Select value={reminderMinutes} onValueChange={setReminderMinutes}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[5, 10, 15, 30, 60, 1440].map((min) => (
                  <SelectItem key={min} value={min.toString()}>
                    {min} phút
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={reminderType} onValueChange={setReminderType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {reminderTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddReminder}
            disabled={processing}
            className="w-full"
          >
            Thêm thông báo
          </Button>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-2 justify-end border-t pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={processing}
        >
          Hủy
        </Button>
        <Button type="submit" disabled={processing}>
          {processing ? 'Đang lưu...' : 'Lưu sự kiện'}
        </Button>
      </div>
    </form>
  );
}
