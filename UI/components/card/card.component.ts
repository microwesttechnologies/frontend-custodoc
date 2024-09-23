import { Component, Input } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [AvatarModule],
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss'
})
export class CardComponent {


  @Input() label: string = "";
  @Input() acuracy: string = "";
  @Input() icon: string =  "";


}
