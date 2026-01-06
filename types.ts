export type ShiftCode = 'D' | 'N' | 'O' | 'W';

export interface ScheduleItem {
  id: string;
  day: number;
  monthStr: string;
  fullDate: string;
  dayOfWeek: string;
  code: ShiftCode;
  description: string;
  isWorking: boolean;
  isToday: boolean;
  hoursWorked: number;
  note?: string;
}