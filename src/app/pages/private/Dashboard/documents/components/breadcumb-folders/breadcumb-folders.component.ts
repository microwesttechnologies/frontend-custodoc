import { Component, EventEmitter, Input, Output } from '@angular/core';
import { LevelFolders } from 'src/app/models/folder.model';
import { SharedModule } from 'src/app/shared-components/shared.module';

@Component({
  selector: 'app-breadcumb-folders',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './breadcumb-folders.component.html',
  styleUrl: './breadcumb-folders.component.scss',
})
export class BreadcumbFoldersComponent {
  @Input() levelFolders: LevelFolders[] = [];

  @Output() eventGoSpecificFolder = new EventEmitter<LevelFolders[]>();

  public goToSpecificFolder(index: number) {
    this.eventGoSpecificFolder.emit(this.levelFolders.slice(0, index + 1));
  }
}
