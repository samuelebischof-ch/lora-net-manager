import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DashboardComponent } from './@pages/dashboard/dashboard.component';
import { SettingsComponent } from './@pages/settings/settings.component';
import { LoginComponent } from './@pages/login/login.component';
import { SetupComponent } from './@pages/setup/setup.component';

const routes: Routes = [
  { path: 'dashboard', component: DashboardComponent },
  { path: 'settings', component: SettingsComponent },
  { path: 'login', component: LoginComponent },
  { path: 'setup', component: SetupComponent },
  { path: '**', component: LoginComponent },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes),
  ],
  exports: [
    RouterModule,
  ]
})
export class AppRoutingModule {}
