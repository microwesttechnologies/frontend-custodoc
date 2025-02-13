import { Pipe, PipeTransform, inject } from '@angular/core';

@Pipe({ name: 'splitText', standalone: true })
export class SplitTextPipe implements PipeTransform {
  transform(text: string, by: string = ''): string[] {
    return text.split(by);
  }
}
