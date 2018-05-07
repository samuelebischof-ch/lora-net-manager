import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { ChartsModule } from 'ng2-charts-x';
import { AngularSplitModule } from 'angular-split';
import { MatNativeDateModule} from '@angular/material';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatListModule } from '@angular/material/list';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { AppRoutingModule } from './app-routing.module';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatExpansionModule } from '@angular/material/expansion';

import { SimpleComponent } from './@components/graphs/simple/simple.component';
import { AppComponent } from './app.component';
import { SidebarComponent } from './@sidebar/sidebar.component';
import { CardComponent } from './@components/card/card.component';
import { DashboardComponent } from './@pages/dashboard/dashboard.component';
import { SidebarButtonComponent } from './@sidebar/sidebar-button/sidebar-button.component';
import { SettingsComponent } from './@pages/settings/settings.component';
import { LoginComponent } from './@pages/login/login.component';
import { GatewayComponent } from './@components/gateways/gateway/gateway.component';
import { GatewaysComponent } from './@components/gateways/gateways.component';
import { DevicesComponent } from './@components/devices/devices.component';
import { DeviceComponent } from './@components/devices/device/device.component';
import { MapComponent, MapDialogComponent } from './@components/map/map.component';
import { DataComponent } from './@components/data/data.component';
import { SetupComponent } from './@pages/setup/setup.component';
import { MeteoComponent } from './@components/meteo/meteo.component';

import { AuthenticationService } from './@services/authentication.service/authentication.service';
import { NotificationsService } from './@services/notifications.service/notifications.service';
import { ApiService } from './@services/api.service/api.service';
import { WsService } from './@services/ws.service/ws.service';

import { DatePipe } from './@pipes/date/date.pipe';
import { HourPipe } from './@pipes/hour/hour.pipe';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';

@NgModule({
  declarations: [
    AppComponent,
    SidebarComponent,
    CardComponent,
    DashboardComponent,
    SimpleComponent,
    SidebarButtonComponent,
    SettingsComponent,
    LoginComponent,
    GatewayComponent,
    GatewaysComponent,
    DevicesComponent,
    DeviceComponent,
    DataComponent,
    MapComponent,
    MapDialogComponent,
    SetupComponent,
    MeteoComponent,
    DatePipe,
    HourPipe,
  ],
  imports: [
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    MatSelectModule,
    AngularSplitModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatExpansionModule,
    MatProgressBarModule,
    MatDialogModule,
    MatInputModule,
    MatListModule,
    MatSnackBarModule,
    MatDatepickerModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatFormFieldModule,
    MatToolbarModule,
    BrowserModule,
    HttpClientModule,
    ChartsModule,
    MatTabsModule,
    MatCheckboxModule,
    MatCardModule,
    MatTooltipModule,
    MatIconModule,
    MatGridListModule,
    MatSidenavModule,
    AppRoutingModule,
    ServiceWorkerModule.register('/ngsw-worker.js', { enabled: environment.production }),
  ],
  entryComponents: [
    MapDialogComponent,
  ],
  providers: [
    AuthenticationService,
    NotificationsService,
    ApiService,
    WsService,
    DatePipe,
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
