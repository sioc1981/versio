import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IssueComponent } from './issue.component';
import { IssueDetailComponent } from './issue-detail.component';

const issueRoutes: Routes = [
    { path: 'issues', component: IssueComponent },
    { path: 'issue/:ref', component: IssueDetailComponent }
];

@NgModule({
    imports: [RouterModule.forChild(issueRoutes)],
    exports: [RouterModule]
})
export class IssueRoutingModule { }
