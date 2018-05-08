import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sensorname'
})
export class SensornamePipe implements PipeTransform {

  transform(value: string): any {
    let sensorName = '';
    const sensorSplit = value.split('_');
    if (sensorSplit.length > 1) {
      sensorName += sensorSplit[1];
    }
    sensorName += ' sensor';
    return this.capitalizeFirstLetter(sensorName);
  }

  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

}
