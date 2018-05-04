import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'date'
})
export class DatePipe implements PipeTransform {

  transform(value: string): string {
    if (value) {
      const date = new Date(value);
      const day = (date.getDate().toString().length < 2) ? ('0' + date.getDate().toString()) : (date.getDate().toString());
      const month = (date.getMonth().toString().length < 2) ? ('0' + date.getMonth().toString()) : (date.getMonth().toString());
      const year = date.getFullYear().toString();
      const hours = (date.getHours().toString().length < 2) ? ('0' + date.getHours().toString()) : (date.getHours().toString());
      const minute = (date.getMinutes().toString().length < 2) ? ('0' + date.getMinutes().toString()) : (date.getMinutes().toString());
      const second = (date.getSeconds().toString().length < 2) ? ('0' + date.getSeconds().toString()) : (date.getSeconds().toString());
      return day + '.' + month + '.' + year + ' at ' + hours + ':' + minute + ':' + second;
    } else {
      return 'never';
    }
  }

}
