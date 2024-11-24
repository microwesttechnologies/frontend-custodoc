import { animate, style, transition, trigger } from '@angular/animations';
import { Component, Input } from '@angular/core';
import { SharedModule } from '../shared.module';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss'],
  imports: [SharedModule],
  standalone: true,
  animations: [
    trigger('notificationSlide', [
      transition(':enter', [
        style({
          transform: '{{translateFrom}}',
          opacity: 0,
        }),
        animate(
          '300ms ease-out',
          style({
            transform: '{{translateTo}}',
            opacity: 1,
          })
        ),
      ]),
      transition(':leave', [
        animate(
          '300ms ease-out',
          style({
            transform: '{{translateFrom}}',
            opacity: 0,
          })
        ),
      ]),
    ]),
  ],
})
export class NotificationComponent {
  @Input() positionClass?: string;
  @Input() message!: string;
  @Input() theme!: string;

  public hideNotification = true;

  get translateEnterAndLeave() {
    const params = {
      translateFrom: '',
      translateTo: '',
    };
    switch (this.positionClass) {
      case 'notification-top-center':
        params.translateFrom = 'translate(-50%, -100%)';
        params.translateTo = 'translate(-50%, 0)';
        break;

      case 'notification-top-right':
        params.translateFrom = 'translate(100%, -100%)';
        params.translateTo = 'translate(0, 0)';
        break;

      case 'notification-top-left':
        params.translateFrom = 'translate(-100%, -100%)';
        params.translateTo = 'translate(0, 0)';
        break;

      case 'notification-bottom-center':
        params.translateFrom = 'translate(-50%, 100%)';
        params.translateTo = 'translate(-50%, 0)';
        break;

      case 'notification-bottom-right':
        params.translateFrom = 'translate(100%, 100%)';
        params.translateTo = 'translate(0, 0)';
        break;

      case 'notification-bottom-left':
        params.translateFrom = 'translate(-100%, 100%)';
        params.translateTo = 'translate(0, 0)';
        break;
    }

    return params;
  }
}
