import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './admin.component';
import { AdminGuard } from './admin.guard';
import { IssueContainerComponent } from './issuecontainer/issuecontainer.component';
import { AdminMenuComponent } from './admin-menu.component';
import { ApplicationUserComponent } from './applicationuser/application-user.component';
import { BatchOptionComponent } from './batchoption/batch-option.component';

const adminRoutes: Routes = [
    {
        path: 'admin',
        component: AdminComponent,
        canActivate: [AdminGuard],
        children: [{
            path: '',
            component: AdminMenuComponent
        }, {
            path: 'issueContainers',
            component: IssueContainerComponent
        }, {
            path: 'applicationUsers',
            component: ApplicationUserComponent
        }, {
            path: 'batchOptions',
            component: BatchOptionComponent
        }]
    }
];

@NgModule({
    imports: [RouterModule.forChild(adminRoutes)],
    exports: [RouterModule]
})
export class AdminRoutingModule { }
