import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './admin.component';
import { AdminGuard } from './admin.guard';

const adminRoutes: Routes = [
    {
        path: 'admin',
        component: AdminComponent,
        canActivate: [ AdminGuard ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(adminRoutes)],
  exports: [ RouterModule ]
})
export class AdminRoutingModule { }
