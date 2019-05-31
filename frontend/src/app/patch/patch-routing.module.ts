import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PatchComponent } from './patch.component';
import { PatchDetailComponent } from './patch-detail.component';

const patchRoutes: Routes = [
    { path: 'patches', component: PatchComponent },
    { path: 'patch/:version/:sequence/:view', component: PatchDetailComponent },
    { path: 'patch/:version/:sequence', component: PatchDetailComponent }
];

@NgModule({
    imports: [RouterModule.forChild(patchRoutes)],
    exports: [RouterModule]
})
export class PatchRoutingModule { }
