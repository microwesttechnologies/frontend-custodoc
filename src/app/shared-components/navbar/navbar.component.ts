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

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    DisabledElementDirective,
    GetObjectPropertiesPipe,
    OverlayDirective,
    TooltipDirective,
    SharedModule,
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent implements OnInit {
  @Input() module!: 'company' | 'user' | 'customer' | 'document' | 'ranking';
  @Input() description!: string;
  @Input() nameFilter = '';
  @Input() title!: string;
  @Input() hiddenPrimaryButton!: boolean;
  @Input() actions: ('export' | 'import')[] = [];

  @Output() nameFilterChange = new EventEmitter<string>();
  @Output() eventClickButton = new EventEmitter<void>();
  @Output() eventExport = new EventEmitter<void>();
  @Output() eventImport = new EventEmitter<void>();

  public countColumns!: number;

  public homologateModule: any = {
    company: 'compañía',
    user: 'empleado',
    customer: 'cliente',
    document: 'documento',
    ranking: 'ranking',
  };

  public disabledOptions: any = {
    customer: {
      3: {
        primaryButton: true,
      },
    },
    document: {
      3: {
        primaryButton: true,
        actions: true,
      },
    },
  };

  public get disabledByModuleAndRol() {
    return this.disabledOptions[this.module]?.[
      this.userLocalService?.user?.id_rol as number
    ];
  }

  public readonly userLocalService = inject(UserLocalService);
  public readonly globalService = inject(GlobalService);

  ngOnInit(): void {
    this.getDetailCompany();
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

  public changeValueFilter(event: KeyboardEvent) {
    this.nameFilter = (event.target as HTMLInputElement).value;
    this.nameFilterChange.emit(this.nameFilter);
  }
}
