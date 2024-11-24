import { Component, Input } from '@angular/core';
import { SharedModule } from '../shared.module';

@Component({
  selector: 'app-item-skeleton',
  templateUrl: './item-skeleton.component.html',
  imports: [SharedModule],
  standalone: true,
})
export class ItemSkeletonComponent {
  @Input() customStyles!: any;
  constructor() {}
}
