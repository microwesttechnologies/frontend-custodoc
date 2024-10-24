import { DecimalPipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [AvatarModule, DecimalPipe],
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
})
export class CardComponent {
  @Input() label: string = '';
  @Input() amount: number = 0;
  @Input() icon: string = '';
}
