import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReleaseCompareComponent } from './release-compare.component';

const releaseCompareRoutes: Routes = [
    { path: 'compare/:fromVersion/:toVersion', component: ReleaseCompareComponent },
    { path: 'compare/:fromVersion', component: ReleaseCompareComponent },
    { path: 'compare', component: ReleaseCompareComponent }
];

@NgModule({
    imports: [RouterModule.forChild(releaseCompareRoutes)],
    exports: [RouterModule]
})
export class ReleaseCompareRoutingModule { }
