import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReleaseComponent } from './release.component';
import { ReleaseDetailComponent } from './release-detail.component';

const releaseRoutes: Routes = [
    { path: 'releases', component: ReleaseComponent },
    { path: 'release/:version/:view', component: ReleaseDetailComponent },
    { path: 'release/:version', component: ReleaseDetailComponent }
];

@NgModule({
    imports: [RouterModule.forChild(releaseRoutes)],
    exports: [RouterModule]
})
export class ReleaseRoutingModule { }
