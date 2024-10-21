import { NgModule, OnInit } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from 'UI/modules/auth/login/login.component';
import { CompanyModuleComponent } from 'UI/modules/Dashboard/company-module/company-module.component';
import { HistoryModuleComponent } from 'UI/modules/Dashboard/history-module/history-module.component';
import { UsersModuleComponent } from 'UI/modules/Dashboard/users-module/users-module.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'company', component: CompanyModuleComponent },
  { path: 'history', component: HistoryModuleComponent },
  { path: 'users', component: UsersModuleComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule{ 



}
