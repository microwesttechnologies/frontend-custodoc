import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ReactiveFormsModule } from '@angular/forms';
import { SidebarComponent } from 'UI/components/sidebar/sidebar.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { GetUserAuthUseCase } from 'Core/Domain/UseCase/GetUserAuthUseCase';
import { HttpClientModule } from '@angular/common/http';
import { GetAllUserUseCases } from 'Core/Domain/UseCase/GetAllUserUseCase';

@NgModule({
  declarations: [
    AppComponent, 
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    SidebarComponent,
    BrowserAnimationsModule,
    HttpClientModule 
    ],
  providers: [GetUserAuthUseCase, GetAllUserUseCases],
  bootstrap: [AppComponent]
})
export class AppModule { }
