import { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { getLunarDateDisplay } from '@/lib/vietnamese-calendar';
import type { VietnameseHoliday } from '@/lib/vietnamese-calendar';

interface CalendarEvent {
  id: number;
  title: string;
  date: Date;
  color: string;
  type: string;
  location?: string;
}

interface Day {
  date: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  fullDate: Date;
  events: CalendarEvent[];
  holiday: VietnameseHoliday | null;
}

interface GoogleCalendarProps {
  month: Date | string;
  events: CalendarEvent[];
  holidays: VietnameseHoliday[];
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onDateClick?: (date: Date) => void;
  onEventClick?: (eventId: number) => void;
}

const colorMap: Record<string, string> = {
  red: 'bg-red-500',
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  yellow: 'bg-yellow-500',
  purple: 'bg-purple-500',
  pink: 'bg-pink-500',
  gray: 'bg-gray-500',
};

export function GoogleStyleCalendar({
  month,
  events,
  holidays,
  onPrevMonth,
  onNextMonth,
  onDateClick,
  onEventClick,
}: GoogleCalendarProps) {
  // Ensure month is a Date object
  const monthDate = month instanceof Date ? month : new Date(typeof month === 'string' ? month + '-01' : new Date());
  
  const year = monthDate.getFullYear();
  const monthNum = monthDate.getMonth() + 1;
  const today = new Date();
  
  const monthName = monthDate.toLocaleDateString('vi-VN', {
    month: 'long',
    year: 'numeric',
  });

  const firstDay = new Date(year, monthDate.getMonth(), 1).getDay();
  const daysInMonth = new Date(year, monthDate.getMonth() + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, monthDate.getMonth(), 0).getDate();

  const days: Day[] = useMemo(() => {
    const result: Day[] = [];

    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
      const date = daysInPrevMonth - i;
      const fullDate = new Date(year, monthDate.getMonth() - 1, date);
      const dateStr = fullDate.toISOString().split('T')[0];
      
      result.push({
        date,
        isCurrentMonth: false,
        isToday: false,
        fullDate,
        events: events.filter((e) => {
          const eventDateStr = e.date instanceof Date ? e.date.toISOString().split('T')[0] : '';
          return eventDateStr === dateStr;
        }),
        holiday: holidays.find((h) => h.date.toISOString().split('T')[0] === dateStr) || null,
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const fullDate = new Date(year, monthDate.getMonth(), i);
      const dateStr = fullDate.toISOString().split('T')[0];
      const isTodayDate = 
        i === today.getDate() &&
        monthDate.getMonth() === today.getMonth() &&
        year === today.getFullYear();

      result.push({
        date: i,
        isCurrentMonth: true,
        isToday: isTodayDate,
        fullDate,
        events: events.filter((e) => {
          const eventDateStr = e.date instanceof Date ? e.date.toISOString().split('T')[0] : '';
          return eventDateStr === dateStr;
        }),
        holiday: holidays.find((h) => h.date.toISOString().split('T')[0] === dateStr) || null,
      });
    }

    // Next month days
    const remainingDays = 42 - result.length;
    for (let i = 1; i <= remainingDays; i++) {
      const fullDate = new Date(year, monthDate.getMonth() + 1, i);
      const dateStr = fullDate.toISOString().split('T')[0];

      result.push({
        date: i,
        isCurrentMonth: false,
        isToday: false,
        fullDate,
        events: events.filter((e) => {
          const eventDateStr = e.date instanceof Date ? e.date.toISOString().split('T')[0] : '';
          return eventDateStr === dateStr;
        }),
        holiday: holidays.find((h) => h.date.toISOString().split('T')[0] === dateStr) || null,
      });
    }

    return result;
  }, [monthDate, year, daysInMonth, firstDay, daysInPrevMonth, events, holidays]);

  return (
    <div className="space-y-1 md:space-y-2">
      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-0 border-b">
        {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((day) => (
          <div key={day} className="text-center font-semibold text-[10px] md:text-sm py-1 md:py-2 text-gray-600">
            {day}
          </div>
        ))}
      </div>
      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-0 border border-gray-200 rounded-lg overflow-hidden">
        {days.map((day, idx) => (
          <div
            key={idx}
            onClick={() => day.isCurrentMonth && onDateClick?.(day.fullDate)}
            className={`
              relative border-r border-b p-1 md:p-2 min-h-[70px] md:min-h-[110px] cursor-pointer transition
              ${day.isCurrentMonth ? 'bg-white hover:bg-blue-50' : 'bg-gray-50'}
              ${day.isToday ? 'bg-blue-50' : ''}
              ${idx % 7 === 6 ? 'border-r-0' : ''}
              ${idx >= days.length - 7 ? 'border-b-0' : ''}
            `}
          >
            {/* Date number - top right */}
            <div className="absolute top-0.5 md:top-1 right-1 md:right-2">
              <span
                className={`
                  text-[10px] md:text-sm font-medium
                  ${day.isToday ? 'bg-blue-500 text-white rounded-full w-5 h-5 md:w-7 md:h-7 flex items-center justify-center text-[10px] md:text-sm' : ''}
                  ${!day.isCurrentMonth ? 'text-gray-400' : 'text-gray-700'}
                `}
              >
                {day.date}
              </span>
            </div>

            {/* Content area */}
            <div className="pt-5 md:pt-8 space-y-0.5 md:space-y-1">
              {/* Holiday */}
              {day.holiday && (
                <div className="mb-0.5 md:mb-1">
                  <div className="bg-yellow-100 border-l-2 md:border-l-4 border-yellow-500 px-1 md:px-2 py-0.5 md:py-1 rounded">
                    <div className="text-[8px] md:text-xs font-semibold text-yellow-900 leading-tight">
                      <span className="hidden md:inline">{day.holiday.isNationalHoliday ? '🇻🇳' : ''} </span>
                      <span className="truncate block">{day.holiday.name}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Events */}
              <div className="space-y-0.5 md:space-y-1">
                {day.events.slice(0, 1).map((event) => (
                  <div
                    key={event.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick?.(event.id);
                    }}
                    className={`
                      text-[8px] md:text-xs px-1 md:px-2 py-0.5 md:py-1 rounded truncate text-white cursor-pointer hover:opacity-80
                      ${colorMap[event.color as keyof typeof colorMap] || 'bg-gray-500'}
                    `}
                    title={event.title}
                  >
                    {event.title}
                  </div>
                ))}
                {day.events.length > 1 && (
                  <div className="text-[8px] md:text-xs text-gray-600 px-1 md:px-2 font-medium">
                    +{day.events.length - 1}
                  </div>
                )}
              </div>
            </div>

            {/* Lunar date - bottom left corner */}
            {day.isCurrentMonth && (
              <div className="absolute bottom-0.5 md:bottom-1 left-0.5 md:left-1 text-[8px] md:text-[10px] text-gray-400">
                {getLunarDateDisplay(day.fullDate)}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
