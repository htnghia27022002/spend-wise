/**
 * Vietnamese Calendar Helper
 * Provides lunar calendar conversion and Vietnamese holidays
 */

import { Solar, Lunar } from 'lunar-typescript';

export interface LunarDate {
  day: number;
  month: number;
  year: number;
  leap: boolean;
}

export interface VietnameseHoliday {
  date: Date;
  lunarDate: LunarDate;
  name: string;
  type: 'lunar' | 'solar' | 'special';
  isNationalHoliday: boolean;
}

// Vietnamese holidays (solar calendar) - format: DD-MM
const solarHolidays: Record<string, string> = {
  '1-1': 'Năm mới dương lịch',
  '9-2': 'Ngày Kỷ niệm Cách mạng Tháng Hai',
  '30-4': 'Ngày Giải phóng / Ngày Thống nhất',
  '1-5': 'Ngày Quốc tế Lao động',
  '2-9': 'Ngày Quốc khánh',
  '3-9': 'Ngày Quốc khánh (Lễ)',
  '20-12': 'Ngày Thầy thuốc Việt Nam',
  '10-10': 'Ngày Phụ nữ Việt Nam',
  '8-3': 'Ngày Phụ nữ Quốc tế',
  '1-6': 'Ngày Thiếu nhi Quốc tế',
};

// Vietnamese lunar holidays - format: DD-MM (lunar)
const lunarHolidays: Record<string, string> = {
  '1-1': 'Tết Nguyên đán',
  '2-1': 'Tết Nguyên đán (Mùng 2)',
  '3-1': 'Tết Nguyên đán (Mùng 3)',
  '15-1': 'Tết Nguyên tiêu (Lễ Hoa đăng)',
  '5-5': 'Tết Đoan ngộ',
  '15-8': 'Tết Trung Thu',
  '23-12': 'Lễ Ông Táo',
  '30-12': 'Tết Cuối năm',
};

/**
 * Convert solar date to lunar date
 */
export function solarToLunar(date: Date): LunarDate {
  try {
    const solar = Solar.fromDate(date);
    const lunar = solar.getLunar();
    
    return {
      day: lunar.getDay(),
      month: Math.abs(lunar.getMonth()), // Tháng âm có thể âm nếu là tháng nhuận
      year: lunar.getYear(),
      leap: lunar.getMonth() < 0, // Tháng âm có nghĩa là tháng nhuận
    };
  } catch (error) {
    console.warn('Lunar calendar conversion failed:', error);
    return {
      day: date.getDate(),
      month: date.getMonth() + 1,
      year: date.getFullYear(),
      leap: false,
    };
  }
}

/**
 * Convert lunar date to solar date
 */
export function lunarToSolar(lunarDate: LunarDate): Date {
  try {
    // Nếu là tháng nhuận, dùng số âm cho month
    const month = lunarDate.leap ? -lunarDate.month : lunarDate.month;
    const lunar = Lunar.fromYmd(lunarDate.year, month, lunarDate.day);
    const solar = lunar.getSolar();
    
    return new Date(solar.getYear(), solar.getMonth() - 1, solar.getDay());
  } catch (error) {
    console.warn('Lunar to solar conversion failed:', error);
    return new Date(lunarDate.year, lunarDate.month - 1, lunarDate.day);
  }
}

/**
 * Get solar holidays for a month
 */
export function getSolarHolidaysForMonth(date: Date): VietnameseHoliday[] {
  const holidays: VietnameseHoliday[] = [];
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  
  Object.entries(solarHolidays).forEach(([dateStr, name]) => {
    const [day, m] = dateStr.split('-').map(Number);
    if (m === month) {
      const holiday = new Date(year, month - 1, day);
      const lunar = solarToLunar(holiday);
      holidays.push({
        date: holiday,
        lunarDate: lunar,
        name,
        type: 'solar',
        isNationalHoliday: name.includes('Giải phóng') || name.includes('Quốc khánh') || name.includes('Tết') || name.includes('Năm mới'),
      });
    }
  });
  
  return holidays;
}

/**
 * Get lunar holidays for a lunar month
 */
export function getLunarHolidaysForMonth(year: number, lunarMonth: number): VietnameseHoliday[] {
  const holidays: VietnameseHoliday[] = [];
  
  Object.entries(lunarHolidays).forEach(([dateStr, name]) => {
    const [day, month] = dateStr.split('-').map(Number);
    if (month === lunarMonth) {
      const lunarDate: LunarDate = {
        day,
        month,
        year,
        leap: false,
      };
      const solar = lunarToSolar(lunarDate);
      
      // Only include if the solar date falls in the same month or nearby
      holidays.push({
        date: solar,
        lunarDate,
        name,
        type: 'lunar',
        isNationalHoliday: name.includes('Tết'),
      });
    }
  });
  
  return holidays;
}

/**
 * Get all holidays for a month (both solar and lunar)
 */
export function getHolidaysForMonth(date: Date): VietnameseHoliday[] {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const lunar = solarToLunar(new Date(year, month - 1, 1));
  
  const solarHols = getSolarHolidaysForMonth(date);
  const lunarHols = getLunarHolidaysForMonth(year, lunar.month);
  
  // Merge and remove duplicates
  const merged = [...solarHols];
  lunarHols.forEach(lh => {
    if (!merged.find(sh => 
      sh.date.getDate() === lh.date.getDate() &&
      sh.date.getMonth() === lh.date.getMonth() &&
      sh.date.getFullYear() === lh.date.getFullYear()
    )) {
      merged.push(lh);
    }
  });
  
  return merged.sort((a, b) => a.date.getTime() - b.date.getTime());
}

/**
 * Check if a date is a Vietnamese holiday
 */
export function isHoliday(date: Date): VietnameseHoliday | null {
  const holidays = getHolidaysForMonth(date);
  return holidays.find(h =>
    h.date.getDate() === date.getDate() &&
    h.date.getMonth() === date.getMonth() &&
    h.date.getFullYear() === date.getFullYear()
  ) || null;
}

/**
 * Format lunar date as string (e.g., "15/8")
 */
export function formatLunarDate(lunarDate: LunarDate): string {
  return `${lunarDate.day}/${lunarDate.month}${lunarDate.leap ? ' (N)' : ''}`;
}

/**
 * Get lunar date display for a solar date
 */
export function getLunarDateDisplay(date: Date): string {
  const lunar = solarToLunar(date);
  return formatLunarDate(lunar);
}
