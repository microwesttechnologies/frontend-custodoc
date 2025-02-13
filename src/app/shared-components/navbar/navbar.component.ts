import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { SharedModule } from '../shared.module';
import { UserLocalService } from 'src/app/services/local/user.service';
import { GlobalService } from 'src/app/services/external/global.service';
import { Detail } from 'src/app/models/global.model';
import { GetObjectPropertiesPipe } from 'src/app/pipes/get-object-properties.pipe';
import { TooltipDirective } from 'src/app/directives/tooltip.directive';
import { OverlayDirective } from 'src/app/directives/overlay.directive';
import { DisabledElementDirective } from 'src/app/directives/disabled-element.directive';
import {
  fadeInCustomAnimation,
  slideCustomAnimation,
} from 'src/app/animations/global.animations';
import { homologateText } from 'src/app/globals/homologate-text';
import { DisabledByPermissionDirective } from 'src/app/directives/disabled-by-permissions.directive';
import { ModulesKeys } from 'src/app/models/permissions.model';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    DisabledByPermissionDirective,
    OverlayDirective,
    TooltipDirective,
    SharedModule,
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
  animations: [
    slideCustomAnimation('slideEnterRight', 'X', '1rem', '0', {
      enter: '300ms',
    }),
    fadeInCustomAnimation('fadeIn', '300ms'),
  ],
})
export class NavbarComponent implements OnInit {
  @Input() module!:
    | 'customer'
    | 'company'
    | 'document'
    | 'ranking'
    | 'trash'
    | 'user'
    | 'rol';
  @Input() description!: string;
  @Input() searchControl!: FormControl;
  @Input() title!: string;
  @Input() hiddenPrimaryButton!: boolean;
  @Input() actions: ('export' | 'import')[] = [];
  @Input() codeModule!: ModulesKeys;

  @Output() eventClickButton = new EventEmitter<void>();
  @Output() eventExport = new EventEmitter<void>();
  @Output() eventImport = new EventEmitter<void>();

  public homologateModule: any = {
    document: 'documento',
    company: 'compañía',
    customer: 'cliente',
    ranking: 'ranking',
    user: 'empleado',
    rol: 'rol',
  };

  public homologateText = homologateText;

  public userLocalService = inject(UserLocalService);
  public globalService = inject(GlobalService);

  ngOnInit(): void {
    // if (this.userLocalService.user?.id_rol !== 3) this.getDetailCompany();
  }

  private getDetailCompany(): void {
    this.globalService.getDetailCompany().subscribe({
      next: (detailCompany) => {
        this.globalService.detailCompany = detailCompany;
      },
    });
  }

  public getValueByKey(key: string): Detail {
    return this.globalService.detailCompany[
      key as keyof typeof this.globalService.detailCompany
    ] as Detail;
  }
}
