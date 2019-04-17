import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

// NGX Bootstrap
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { BsDropdownConfig, BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { ModalModule } from 'ngx-bootstrap/modal';

import { AboutModalModule, ListModule, VerticalNavigationModule, WizardModule, InfoStatusCardModule,
     ActionModule, ToastNotificationListModule, NotificationService, TableModule, ToolbarModule,
     PaginationModule, CardModule, UtilizationDonutChartModule, DonutChartModule } from 'patternfly-ng';

import { AppComponent } from './app.component';
import { NavigationComponent } from './navigation/navigation.component';
import { AppRoutingModule } from './app-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { IssueCreateComponent } from './issue/issue-create.component';
import { IssueComponent } from './issue/issue.component';
import { PatchComponent } from './patch/patch.component';
import { PatchCreateComponent } from './patch/patch-create.component';
import { PatchUpdateComponent } from './patch/patch-update.component';
import { ServerEventComponent } from './server-event/server-event.component';
import { ReleaseComponent } from './release/release.component';
import { ReleaseCreateComponent } from './release/release-create.component';
import { ReleaseUpdateComponent } from './release/release-update.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { SseService } from './server-event/sse.service';
import { HistoryColorDirective } from './shared/history-color.directive';
import { ReleaseCardComponent } from './dashboard/release-card/release-card.component';
import { SummaryColorDirective } from './shared/summary-color.directive';

@NgModule({
  declarations: [
    AppComponent,
    IssueComponent,
    IssueCreateComponent,
    PatchComponent,
    PatchCreateComponent,
    PatchUpdateComponent,
    ReleaseComponent,
    ReleaseCreateComponent,
    ReleaseUpdateComponent,
    NavigationComponent,
    DashboardComponent,
    ServerEventComponent,
    HistoryColorDirective,
    SummaryColorDirective,
    ReleaseCardComponent
  ],
  imports: [
    AboutModalModule,
    ActionModule,
    AppRoutingModule,
    BsDatepickerModule.forRoot(),
    BsDropdownModule.forRoot(),
    BrowserModule,
    CardModule,
    DonutChartModule,
    FormsModule,
    HttpClientModule,
    InfoStatusCardModule,
    ListModule,
    ModalModule.forRoot(),
    NgxDatatableModule,
    PaginationModule,
    TableModule,
    ToastNotificationListModule,
    ToolbarModule,
    TypeaheadModule.forRoot(),
    VerticalNavigationModule,
    UtilizationDonutChartModule,
    WizardModule
  ],
  providers: [BsDropdownConfig, NotificationService, SseService],
  bootstrap: [AppComponent]
})
export class AppModule { }
