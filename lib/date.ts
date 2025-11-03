import { startOfWeek, endOfWeek, addWeeks, startOfMonth, endOfMonth, differenceInDays, parseISO, format } from 'date-fns';

export function nextDueDate(dueDay: number, today: Date): Date {
  const year = today.getFullYear();
  const month = today.getMonth();
  
  // Clamp due day to valid range for the month
  const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
  const clampedDay = Math.min(dueDay, lastDayOfMonth);
  
  const candidateDate = new Date(year, month, clampedDay);
  
  // If the due day has passed this month, move to next month
  if (candidateDate < today) {
    const nextMonth = new Date(year, month + 1, 1);
    const nextLastDay = new Date(year, month + 2, 0).getDate();
    const nextClampedDay = Math.min(dueDay, nextLastDay);
    return new Date(year, month + 1, nextClampedDay);
  }
  
  return candidateDate;
}

export function inThisWeek(today: Date, weekStart: 'mon' | 'sun'): [Date, Date] {
  const start = startOfWeek(today, { weekStartsOn: weekStart === 'mon' ? 1 : 0 });
  const end = endOfWeek(today, { weekStartsOn: weekStart === 'mon' ? 1 : 0 });
  return [start, end];
}

export function inNextWeek(today: Date, weekStart: 'mon' | 'sun'): [Date, Date] {
  const thisWeekStart = startOfWeek(today, { weekStartsOn: weekStart === 'mon' ? 1 : 0 });
  const nextWeekStart = addWeeks(thisWeekStart, 1);
  const nextWeekEnd = endOfWeek(nextWeekStart, { weekStartsOn: weekStart === 'mon' ? 1 : 0 });
  return [nextWeekStart, nextWeekEnd];
}

export function inThisMonth(today: Date): [Date, Date] {
  const start = startOfMonth(today);
  const end = endOfMonth(today);
  return [start, end];
}

export function daysUntilDue(dueDate: Date, today: Date): number {
  const days = differenceInDays(dueDate, today);
  return Math.max(0, days);
}

export function isDateInRange(date: Date, start: Date, end: Date): boolean {
  return date >= start && date <= end;
}

