import { Component, inject, OnInit } from '@angular/core';
import { SharedModule } from '../shared.module';
import { UserLocalService } from 'src/app/services/local/user.service';
import { CardComponent } from '../card/card.component';
import { GlobalService } from 'src/app/services/external/global.service';
import { Detail } from 'src/app/models/global.model';
import { GetObjectPropertiesPipe } from 'src/app/pipes/get-object-properties.pipe';

@Component({
  selector: 'app-list-cards',
  standalone: true,
  imports: [SharedModule, CardComponent, GetObjectPropertiesPipe],
  templateUrl: './list-cards.component.html',
  styleUrl: './list-cards.component.scss',
})
export class ListCardsComponent implements OnInit {
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

  getValueByKey(key: string): Detail {
    return this.globalService.detailCompany[
      key as keyof typeof this.globalService.detailCompany
    ] as Detail;
  }
}
