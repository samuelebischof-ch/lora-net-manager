import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'objectkeys'
})
export class ObjectkeysPipe implements PipeTransform {

  transform(value, args: string[]): any {
    const keys = [];
    for (const key in value) {
      if (value.hasOwnProperty(key)) {
        keys.push(key);
      }
    }
    return keys;
  }

}
