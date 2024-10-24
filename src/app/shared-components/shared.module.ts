import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule, // Para formularios reactivos
    RouterModule, // Para enrutamiento
  ],
  exports: [
    CommonModule, // Exporta para que otros componentes standalone lo usen
    ReactiveFormsModule,
    RouterModule,
  ],
})
export class SharedModule {}
