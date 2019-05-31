import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ForbiddenPageComponent } from './misc/forbidden-page.component';
import { PageNotFoundComponent } from './misc/page-not-found.component';
import { AdminRoutingModule } from './admin/admin-routing.module';
import { IssueRoutingModule } from './issue/issue-routing.module';
import { PatchRoutingModule } from './patch/patch-routing.module';
import { ReleaseCompareRoutingModule } from './release-compare/release-compare-routing.module';
import { ReleaseRoutingModule } from './release/release-routing.module';

const routes: Routes = [
    { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
    { path: 'dashboard', component: DashboardComponent },
    { path: 'forbidden', component: ForbiddenPageComponent },
    { path: '**', component: PageNotFoundComponent }
];


@NgModule({
    imports: [
        AdminRoutingModule,
        IssueRoutingModule,
        PatchRoutingModule,
        ReleaseRoutingModule,
        ReleaseCompareRoutingModule,
        RouterModule.forRoot(routes, { useHash: true }) // always last
    ],
  exports: [ RouterModule ]
})
export class AppRoutingModule { }
