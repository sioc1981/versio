import { BrowserModule } from '@angular/platform-browser';
import { NgModule, LOCALE_ID } from '@angular/core';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

// NGX Bootstrap
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { BsDropdownConfig, BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { NgxUploadModule } from '@wkoza/ngx-upload';
import { MarkdownModule } from 'ngx-markdown';
import { UiSwitchModule } from 'ngx-toggle-switch';

import {
    AboutModalModule, ListModule, VerticalNavigationModule, WizardModule, InfoStatusCardModule,
    ActionModule, ToastNotificationListModule, NotificationService, TableModule, ToolbarModule,
    PaginationModule, CardModule, UtilizationDonutChartModule, DonutChartModule, EmptyStateModule
} from 'patternfly-ng';

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
import { ReleaseCompareComponent } from './release-compare/release-compare.component';
import { VersionGraphComponent } from './release-compare/version-graph.component';
import { IssueUpdateComponent } from './issue/issue-update.component';
import { IssueImportComponent } from './issue/issue-import.component';
import { ReleaseImportComponent } from './release/release-import.component';
import { PatchImportComponent } from './patch/patch-import.component';
import { SkipUndeployPipe } from './shared/skip-undeploy.pipe';
import { ReleaseDetailComponent } from './release/release-detail.component';

import { registerLocaleData } from '@angular/common';
import { defineLocale } from 'ngx-bootstrap/chronos';
import localeFr from '@angular/common/locales/fr';
import { frLocale } from 'ngx-bootstrap/locale';
import { PatchDetailComponent } from './patch/patch-detail.component';
import { PageNotFoundComponent } from './misc/page-not-found.component';

// the second parameter 'fr' is optional
registerLocaleData(localeFr, 'fr');
defineLocale('fr', frLocale);

@NgModule({
    declarations: [
        AppComponent,
        IssueComponent,
        IssueCreateComponent,
        PatchComponent,
        PatchCreateComponent,
        PatchDetailComponent,
        PatchUpdateComponent,
        ReleaseComponent,
        ReleaseCreateComponent,
        ReleaseDetailComponent,
        ReleaseUpdateComponent,
        NavigationComponent,
        DashboardComponent,
        ServerEventComponent,
        HistoryColorDirective,
        SummaryColorDirective,
        ReleaseCardComponent,
        ReleaseCompareComponent,
        VersionGraphComponent,
        IssueUpdateComponent,
        IssueImportComponent,
        ReleaseImportComponent,
        PatchImportComponent,
        SkipUndeployPipe,
        PageNotFoundComponent,
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
        EmptyStateModule,
        FormsModule,
        HttpClientModule,
        InfoStatusCardModule,
        ListModule,
        MarkdownModule.forRoot({ loader: HttpClient }),
        ModalModule.forRoot(),
        NgxDatatableModule,
        NgxUploadModule.forRoot(),
        PaginationModule,
        TableModule,
        TabsModule.forRoot(),
        ToastNotificationListModule,
        ToolbarModule,
        TypeaheadModule.forRoot(),
        VerticalNavigationModule,
        UiSwitchModule,
        UtilizationDonutChartModule,
        WizardModule
    ],
    providers: [BsDropdownConfig, NotificationService, SseService,
        { provide: LOCALE_ID, useValue: 'fr' }],
    bootstrap: [AppComponent]
})
export class AppModule { }
