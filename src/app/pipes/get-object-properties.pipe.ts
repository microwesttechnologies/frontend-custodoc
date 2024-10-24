import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'getObjectProperties', standalone: true })
export class GetObjectPropertiesPipe implements PipeTransform {
  transform(object: object): string[] {
    return typeof object === 'object' ? Object.keys(object) : [];
  }
}
