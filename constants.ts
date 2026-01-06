import { ScheduleItem, ShiftCode } from './types';

// Removed 'hours' property as they are variable
const SHIFTS: Record<string, { code: ShiftCode; description: string; isWorking: boolean }> = {
  D: { code: 'D', description: 'Praca', isWorking: true },
  N: { code: 'N', description: 'Praca', isWorking: true }, // Kept for type safety, though we mostly use D now
  O: { code: 'O', description: 'Praca', isWorking: true },
  W: { code: 'W', description: 'Dzień wolny', isWorking: false },
};

export const generateScheduleData = (): ScheduleItem[] => {
  const items: ScheduleItem[] = [];
  const monthNames = ["Stycznia", "Lutego", "Marca", "Kwietnia", "Maja", "Czerwca", "Lipca", "Sierpnia", "Września", "Października", "Listopada", "Grudnia"];
  const dayNames = ["Niedziela", "Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek", "Sobota"];

  // Get current real date
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonthIndex = now.getMonth();
  const currentDay = now.getDate();
  
  const currentMonthName = monthNames[currentMonthIndex];
  
  // Get number of days in the actual current month
  // (Year, Month + 1, 0) gives the last day of the current month
  const daysInMonth = new Date(currentYear, currentMonthIndex + 1, 0).getDate();
  
  // Specific days off as requested: 1, 8, 12, 19 (Removed 5 to make it a work day)
  const daysOff = [1, 8, 12, 19];

  for (let i = 1; i <= daysInMonth; i++) {
    // Determine shift based on specific days
    let shiftKey: string;
    
    if (daysOff.includes(i)) {
        shiftKey = 'W';
    } else {
        shiftKey = 'D'; // All other days are work
    }

    const shiftData = SHIFTS[shiftKey];

    // Check against real date
    const isToday = i === currentDay;

    // Create date object for this specific day to get the day of the week
    const dateObj = new Date(currentYear, currentMonthIndex, i);
    const dayOfWeekStr = dayNames[dateObj.getDay()];

    // Format Full Date YYYY-MM-DD
    const monthStrPadded = (currentMonthIndex + 1).toString().padStart(2, '0');
    const dayStrPadded = i.toString().padStart(2, '0');

    // Hardcode default hours and notes
    let initialHours = 0;
    let initialNote = '';

    if (i === 2) {
        initialHours = 12.5;
    } else if (i === 3) {
        initialHours = 13;
        initialNote = '12h 46min';
    } else if (i === 4) {
        initialHours = 12.5;
        initialNote = '12h 38min';
    } else if (i === 5) {
        initialHours = 10.5;
    }

    items.push({
      id: `day-${i}`,
      day: i,
      monthStr: currentMonthName,
      fullDate: `${currentYear}-${monthStrPadded}-${dayStrPadded}`,
      dayOfWeek: dayOfWeekStr,
      ...shiftData,
      isToday: isToday,
      hoursWorked: initialHours,
      note: initialNote, 
    });
  }
  
  return items;
};

export const MOCK_SCHEDULE = generateScheduleData();