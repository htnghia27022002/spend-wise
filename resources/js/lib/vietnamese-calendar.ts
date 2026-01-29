/**
 * Vietnamese Calendar Helper
 * Provides lunar calendar conversion and Vietnamese holidays
 */

import LunarCalendar from 'lunar-calendar';

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

// Vietnamese holidays (solar calendar)
const solarHolidays: Record<string, string> = {
  '1-1': 'Năm mới dương lịch',
  '2-9': 'Ngày Kỷ niệm Cách mạng Tháng Hai',
  '4-30': 'Ngày Giải phóng / Ngày Thống nhất',
  '5-1': 'Ngày Quốc tế Lao động',
  '9-2': 'Ngày Quốc khánh',
  '9-3': 'Ngày Quốc khánh (Lễ)',
  '12-20': 'Ngày Thầy thuốc Việt Nam',
  '10-10': 'Ngày Phụ nữ Việt Nam',
  '1-8': 'Ngày Phụ nữ Quốc tế',
  '6-1': 'Ngày Thiếu nhi Quốc tế',
};

// Vietnamese lunar holidays
const lunarHolidays: Record<string, string> = {
  '1-1': 'Tết Nguyên đán',
  '1-2': 'Tết Nguyên đán (Mùng 2)',
  '1-3': 'Tết Nguyên đán (Mùng 3)',
  '1-15': 'Tết Nguyên tiêu (Lễ Hoa đăng)',
  '5-5': 'Tết Đoan ngộ',
  '8-15': 'Tết Trung Thu',
  '12-23': 'Lễ Ông Táo',
  '12-30': 'Tết Cuối năm',
};

/**
 * Convert solar date to lunar date
 */
export function solarToLunar(date: Date): LunarDate {
  try {
    const solar = {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
    };
    
    const lunar = (LunarCalendar as any).solarToLunar(solar);
    
    if (!lunar || typeof lunar !== 'object') {
      // Fallback to a basic calculation
      return {
        day: date.getDate(),
        month: date.getMonth() + 1,
        year: date.getFullYear(),
        leap: false,
      };
    }
    
    return {
      day: lunar.day || date.getDate(),
      month: lunar.month || date.getMonth() + 1,
      year: lunar.year || date.getFullYear(),
      leap: lunar.isleap || false,
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
    const result = (LunarCalendar as any).lunarToSolar({
      year: lunarDate.year,
      month: lunarDate.month,
      day: lunarDate.day,
      isleap: lunarDate.leap,
    });
    
    if (!result || typeof result !== 'object') {
      return new Date(lunarDate.year, lunarDate.month - 1, lunarDate.day);
    }
    
    return new Date(result.year, (result.month || 1) - 1, result.day || 1);
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
