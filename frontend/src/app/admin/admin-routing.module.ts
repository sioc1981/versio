import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './admin.component';
import { AdminGuard } from './admin.guard';
import { IssueContainerComponent } from './issuecontainer/issuecontainer.component';

const adminRoutes: Routes = [
    {
        path: 'admin',
        component: AdminComponent,
        canActivate: [AdminGuard],
        children: [{
            path: 'issueContainers',
            component: IssueContainerComponent
        }]
    }
];

@NgModule({
    imports: [RouterModule.forChild(adminRoutes)],
    exports: [RouterModule]
})
export class AdminRoutingModule { }
