import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { IssueComponent } from './issue/issue.component';
import { PatchComponent } from './patch/patch.component';
import { ReleaseComponent } from './release/release.component';

const routes: Routes = [
    { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
    { path: 'dashboard', component: DashboardComponent },
    { path: 'patchs', component: PatchComponent },
    { path: 'releases', component: ReleaseComponent },
    { path: 'issues', component: IssueComponent }
];


@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [ RouterModule ]
})
export class AppRoutingModule { }
