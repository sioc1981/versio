import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

// NGX Bootstrap
import { BsDropdownConfig, BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ModalModule } from 'ngx-bootstrap/modal';

import { AboutModalModule, ListModule, VerticalNavigationModule, WizardModule, InfoStatusCardModule,
     ActionModule, ToastNotificationListModule, NotificationService, TableModule } from 'patternfly-ng';

import { AppComponent } from './app.component';
import { NavigationComponent } from './navigation/navigation.component';
import { AppRoutingModule } from './app-routing.module';
import { VersionComponent } from './version/version.component';
import { VersionCreateComponent } from './version/version-create.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { IssueCreateComponent } from './issue/issue-create.component';
import { IssueComponent } from './issue/issue.component';
import { PatchComponent } from './patch/patch.component';
import { PatchCreateComponent } from './patch/patch-create.component';
import { ServerEventComponent } from './server-event/server-event.component';
import { ReleaseComponent } from './release/release.component';
import { ReleaseCreateComponent } from './release/release-create.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

@NgModule({
  declarations: [
    AppComponent,
    IssueComponent,
    IssueCreateComponent,
    PatchComponent,
    PatchCreateComponent,
    ReleaseComponent,
    ReleaseCreateComponent,
    NavigationComponent,
    VersionComponent,
    VersionCreateComponent,
    DashboardComponent,
    ServerEventComponent
  ],
  imports: [
    AboutModalModule,
    ActionModule,
    AppRoutingModule,
    BsDropdownModule.forRoot(),
    BrowserModule,
    FormsModule,
    HttpClientModule,
    InfoStatusCardModule,
    ListModule,
    ModalModule.forRoot(),
    NgxDatatableModule,
    TableModule,
    ToastNotificationListModule,
    VerticalNavigationModule,
    WizardModule
  ],
  providers: [BsDropdownConfig, NotificationService],
  bootstrap: [AppComponent]
})
export class AppModule { }
