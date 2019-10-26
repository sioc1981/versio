import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { UtilizationDonutChartConfig } from 'patternfly-ng';
import { Subscription } from 'rxjs';
import { ReleaseSummary } from '../release/shared/release.model';
import { RELEASE_CONSTANT } from '../release/shared/release.constant';

@Component({
    encapsulation: ViewEncapsulation.None,
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {

    releaseSummaries: ReleaseSummary[] = this.loadReleases();

    packageConfig: UtilizationDonutChartConfig = {
        chartId: 'exampleUtilizationDonut',
        centerLabelFormat: 'used',
        outerLabelAlignment: 'right',
        thresholds: { 'warning': 60, 'error': 80 },
        total: 100,
        units: 'Package',
        used: 10
    };

    private subscriptions: Subscription[] = [];
    constructor() { }

    ngOnInit() {
        this.subscriptions.push(RELEASE_CONSTANT.releaseSummariesNotifier$.subscribe(() => {
             this.releaseSummaries = this.loadReleases();
        }));
    }

    private loadReleases(): ReleaseSummary[] {
        return Array.from(RELEASE_CONSTANT.releaseSummaries).sort((ra, rb) => rb.versionNumber.localeCompare(ra.versionNumber));
    }
    /**
      * Clean up subscriptions
      */
    ngOnDestroy(): void {
        this.subscriptions.forEach(sub => sub.unsubscribe);
    }

}
