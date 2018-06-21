import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'battery'
})
export class BatteryPipe implements PipeTransform {

  transform(value: any): any {
    if (value === null) {
      return 'Device not activated';
    } else {
      return ((value / 255) * 100) + ' %';
    }
  }

}
