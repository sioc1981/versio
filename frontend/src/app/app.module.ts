import { BrowserModule } from '@angular/platform-browser';
import { NgModule, LOCALE_ID, APP_INITIALIZER } from '@angular/core';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';

// NGX Bootstrap
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { BsDropdownConfig, BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { CarouselModule } from 'ngx-bootstrap/carousel';
import { ProgressbarModule } from 'ngx-bootstrap/progressbar';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { NgxUploadModule } from '@wkoza/ngx-upload';
import { LMarkdownEditorModule } from 'ngx-markdown-editor';
import { MarkdownModule } from 'ngx-markdown';
import { UiSwitchModule } from 'ngx-toggle-switch';
import { KeycloakAngularModule } from 'keycloak-angular';

import {
    AboutModalModule, ListModule, VerticalNavigationModule, WizardModule, InfoStatusCardModule,
    ActionModule, ToastNotificationListModule, NotificationService, TableModule, ToolbarModule,
    PaginationModule, CardModule, UtilizationDonutChartModule, DonutChartModule, EmptyStateModule, CopyService,
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
import { initializer } from './app-init';

import { registerLocaleData } from '@angular/common';
import { defineLocale } from 'ngx-bootstrap/chronos';
import localeFr from '@angular/common/locales/fr';
import { frLocale } from 'ngx-bootstrap/locale';
import { PatchDetailComponent } from './patch/patch-detail.component';
import { PageNotFoundComponent } from './misc/page-not-found.component';
import { ReleaseCardChartContainerComponent } from './dashboard/release-card/release-card-chart-container.component';
import { AuthenticationService } from './auth/authentication.service';
import { AdminComponent } from './admin/admin.component';
import { ApplicationsComponent } from './admin/application/applications/applications.component';
import { ForbiddenPageComponent } from './misc/forbidden-page.component';
import { IssueContainerComponent } from './admin/issuecontainer/issuecontainer.component';
import { AdminMenuComponent } from './admin/admin-menu.component';
import { IssueDetailComponent } from './issue/issue-detail.component';
import { ApplicationUserComponent } from './admin/applicationuser/application-user.component';
import { ApplicationUserCreateComponent } from './admin/applicationuser/application-user-create.component';
import { ApplicationUserLogoThumbnailDirective } from './admin/applicationuser/application-user-logo-thumbnail.directive';
import { SafePipe } from './shared/safe.pipe';
import { DisplayComponent } from './dashboard/display.component';

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
        ReleaseCardChartContainerComponent,
        AdminComponent,
        ApplicationsComponent,
        ForbiddenPageComponent,
        IssueContainerComponent,
        AdminMenuComponent,
        IssueDetailComponent,
        ApplicationUserComponent,
        ApplicationUserCreateComponent,
        ApplicationUserLogoThumbnailDirective,
        SafePipe,
        DisplayComponent
    ],
    imports: [
        AboutModalModule,
        ActionModule,
        AppRoutingModule,
        BsDatepickerModule.forRoot(),
        BsDropdownModule.forRoot(),
        BrowserModule,
        CardModule,
        CarouselModule.forRoot(),
        DonutChartModule,
        EmptyStateModule,
        FormsModule,
        HttpClientModule,
        InfoStatusCardModule,
        KeycloakAngularModule,
        ListModule,
        LMarkdownEditorModule,
        MarkdownModule.forRoot({ loader: HttpClient }),
        ModalModule.forRoot(),
        NgSelectModule,
        NgxDatatableModule,
        NgxUploadModule.forRoot(),
        PaginationModule,
        ProgressbarModule.forRoot(),
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
    providers: [{
        provide: APP_INITIALIZER,
        useFactory: initializer,
        multi: true,
        deps: [AuthenticationService]
    },
        BsDropdownConfig,
        CopyService,
        NotificationService,
        SseService,
    { provide: LOCALE_ID, useValue: 'fr' }
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
