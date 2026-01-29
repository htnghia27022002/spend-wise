import { Head } from '@inertiajs/react';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import {
  getHolidaysForMonth,
  getLunarDateDisplay,
  type VietnameseHoliday,
} from '@/lib/vietnamese-calendar';
import { GoogleStyleCalendar } from '@/components/google-style-calendar';
import { CalendarEventForm } from '@/components/calendar-event-form';

interface CalendarEvent {
  id: number;
  title: string;
  description?: string;
  start_date: string;
  end_date?: string;
  type: 'payment_due' | 'subscription_due' | 'installment_due' | 'custom' | 'reminder';
  color: 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'pink' | 'gray';
  is_all_day: boolean;
  location?: string;
  metadata?: any;
  reminders?: any[];
}

interface Props {
  events: CalendarEvent[];
  month: string;
}

export default function Index({ events, month: initialMonth }: Props) {
  const parseMonth = (monthStr: string | undefined): Date => {
    try {
      if (!monthStr || typeof monthStr !== 'string') {
        return new Date();
      }
      const [year, m] = monthStr.split('-').map(Number);
      if (!year || !m) {
        return new Date();
      }
      return new Date(year, m - 1, 1);
    } catch (error) {
      console.warn('Failed to parse month:', error, monthStr);
      return new Date();
    }
  };

  const [currentMonth, setCurrentMonth] = useState<Date>(() => {
    return parseMonth(initialMonth);
  });

  const [holidays, setHolidays] = useState<VietnameseHoliday[]>(() => {
    try {
      const month = parseMonth(initialMonth);
      return getHolidaysForMonth(month);
    } catch (error) {
      console.warn('Failed to get holidays:', error);
      return [];
    }
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month' | 'year'>('month');

  const handlePrevMonth = () => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    setCurrentMonth(newDate);
    try {
      setHolidays(getHolidaysForMonth(newDate));
    } catch (error) {
      console.warn('Failed to get holidays for month:', error);
      setHolidays([]);
    }
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
    setCurrentMonth(newDate);
    try {
      setHolidays(getHolidaysForMonth(newDate));
    } catch (error) {
      console.warn('Failed to get holidays for month:', error);
      setHolidays([]);
    }
  };

  const handleToday = () => {
    const today = new Date();
    const newDate = new Date(today.getFullYear(), today.getMonth(), 1);
    setCurrentMonth(newDate);
    try {
      setHolidays(getHolidaysForMonth(newDate));
    } catch (error) {
      console.warn('Failed to get holidays for month:', error);
      setHolidays([]);
    }
  };

  const handleDateClick = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0] + ' 00:00';
    setSelectedDate(dateStr);
    setIsModalOpen(true);
  };

  const handleEventClick = (eventId: number) => {
    window.location.href = `/calendar/${eventId}`;
  };

  const handleCreateNew = () => {
    const dateStr = new Date().toISOString().split('T')[0] + ' 00:00';
    setSelectedDate(dateStr);
    setIsModalOpen(true);
  };

  const monthName = currentMonth.toLocaleDateString('vi-VN', {
    month: 'long',
    year: 'numeric',
  });

  // Prepare events for calendar display (only for current month)
  const currentMonthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const currentMonthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

  const monthEvents = events
    .filter((e) => {
      const eventDate = new Date(e.start_date);
      return eventDate >= currentMonthStart && eventDate <= currentMonthEnd;
    })
    .map((e) => ({
      id: e.id,
      title: e.title,
      date: new Date(e.start_date),
      color: e.color,
      type: e.type,
      location: e.location,
    }));

  return (
    <AppLayout>
      <Head title="Lịch" />

      <main className="h-screen flex flex-col bg-white">
        {/* Header */}
        <header className="flex items-center justify-between gap-2 md:gap-4 px-3 md:px-6 py-3 border-b bg-white">
          <div className="flex items-center gap-2 md:gap-4">
            <h1 className="text-lg md:text-2xl font-bold">Lịch</h1>
            <Button variant="outline" size="sm" onClick={handleToday} className="hidden sm:flex">
              Hôm nay
            </Button>
            <Button variant="outline" size="icon" onClick={handleToday} className="sm:hidden h-8 w-8">
              <span className="text-xs">📅</span>
            </Button>
            <div className="flex items-center gap-1 md:gap-2">
              <Button variant="outline" size="icon" onClick={handlePrevMonth} className="h-8 w-8">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleNextMonth} className="h-8 w-8">
                <ChevronRight className="h-4 w-4" />
              </Button>
              <span className="text-xs md:text-base font-semibold min-w-[100px] md:min-w-[180px] text-center">{monthName}</span>
            </div>
          </div>

          <div className="flex items-center gap-1 md:gap-2">
            {/* View Mode Selector */}
            <Select value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
              <SelectTrigger className="w-[80px] md:w-[120px] h-8 md:h-10 text-xs md:text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Ngày</SelectItem>
                <SelectItem value="week">Tuần</SelectItem>
                <SelectItem value="month">Tháng</SelectItem>
                <SelectItem value="year">Năm</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={handleCreateNew} size="sm" className="h-8 md:h-10">
              <Plus className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Tạo</span>
            </Button>
          </div>
        </header>

        {/* Calendar Grid */}
        <div className="flex-1 overflow-auto px-2 md:px-6 py-2 md:py-4">
          <GoogleStyleCalendar
            month={currentMonth}
            events={monthEvents}
            holidays={holidays}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
            onDateClick={handleDateClick}
            onEventClick={handleEventClick}
          />
        </div>
      </main>

      {/* Event Creation Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-[95vw] md:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base md:text-lg">Thêm sự kiện mới</DialogTitle>
          </DialogHeader>
          <div className="px-4 md:px-6 py-4">
            <CalendarEventForm
              initialDate={selectedDate}
              onClose={() => {
                setIsModalOpen(false);
                window.location.reload();
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
