import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'getObjectProperties', standalone: true })
export class GetObjectPropertiesPipe implements PipeTransform {
  transform(
    object: object,
    property: 'keys' | 'values' | 'entries' = 'keys'
  ): string[] {
    return typeof object === 'object' ? Object[property](object) : [];
  }
}
