import { Component, HostBinding, inject } from '@angular/core';
import { HistoryModuleComponent } from './history-module/history-module.component';
import { FoldersComponent } from './folders/folders.component';
import { UserLocalService } from 'src/app/services/local/user.service';

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [HistoryModuleComponent, FoldersComponent],
  templateUrl: './documents.component.html',
  styleUrl: './documents.component.scss',
})
export class DocumentsComponent {
  @HostBinding('style') defaultStyle = {
    height: '100%',
  };

  public userLocalService = inject(UserLocalService);
}
