declare module 'lunar-javascript' {
  export class Solar {
    static fromDate(date: Date): Solar;
    getCalendar(): number;
    getLunar(): Lunar;
    getDay(): number;
    toYmd(): string;
  }

  export class Lunar {
    getYear(): number;
    getMonth(): number;
    getDay(): number;
    getSolar(): Solar;
    next(days: number): void;
  }
} 