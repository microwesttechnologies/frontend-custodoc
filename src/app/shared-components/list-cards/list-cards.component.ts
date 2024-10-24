import { Component, inject } from '@angular/core';
import { SharedModule } from '../shared.module';
import { UserService } from '../../services/local/user.service';
import { CardComponent } from '../card/card.component';

@Component({
  selector: 'app-list-cards',
  standalone: true,
  imports: [SharedModule, CardComponent],
  templateUrl: './list-cards.component.html',
  styleUrl: './list-cards.component.scss',
})
export class ListCardsComponent {
  items = [
    { label: 'Documentos', acuracy: '5,423', icon: 'pi pi-users' },
    { label: 'Usuarios', acuracy: '1,893', icon: 'pi pi-user' },
    { label: 'Compañias', acuracy: '189', icon: 'pi pi-warehouse' },
    { label: 'Ciudades', acuracy: '32', icon: 'pi pi-warehouse' },
  ];

  public readonly userService = inject(UserService);
}
