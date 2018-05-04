import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'hour'
})
export class HourPipe implements PipeTransform {

  transform(value: string): string {
    switch (value) {
      case '12AM': return '00:00';
      case '1AM': return '01:00';
      case '2AM': return '02:00';
      case '3AM': return '03:00';
      case '4AM': return '04:00';
      case '5AM': return '05:00';
      case '6AM': return '06:00';
      case '7AM': return '07:00';
      case '8AM': return '08:00';
      case '9AM': return '09:00';
      case '10AM': return '10:00';
      case '11AM': return '11:00';
      case '12PM': return '12:00';
      case '1PM': return '13:00';
      case '2PM': return '14:00';
      case '3PM': return '15:00';
      case '4PM': return '16:00';
      case '5PM': return '17:00';
      case '6PM': return '18:00';
      case '7PM': return '19:00';
      case '8PM': return '20:00';
      case '9PM': return '21:00';
      case '10PM': return '22:00';
      case '11PM': return '23:00';
      default: return value;
    }
  }

}
