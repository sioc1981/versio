import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { UtilizationDonutChartConfig } from 'patternfly-ng';
import { Subscription } from 'rxjs';
import { ReleaseSummary } from '../release/shared/release.model';
import { RELEASE_CONSTANT } from '../release/shared/release.constant';
import { ApplicationUser } from '../admin/applicationuser/shared/application-user.model';
import { APPLICATION_USER_CONSTANT } from '../admin/applicationuser/shared/application-user.constant';
import { ActivatedRoute } from '@angular/router';

@Component({
    encapsulation: ViewEncapsulation.None,
    selector: 'app-dashboard-display',
    templateUrl: './display.component.html',
    styleUrls: ['./display.component.less']
})
export class DisplayComponent implements OnInit, OnDestroy {

    releaseSummaries: ReleaseSummary[] = [];
    filteredReleaseSummaries: ReleaseSummary[] = [];
    applicationUser: ApplicationUser;
    appUser = '';

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
    constructor(private route: ActivatedRoute) { }

    ngOnInit() {
        this.reloadApplicationUsers();
        this.loadReleases();
        this.filterReleaseSummaries();
        this.subscriptions.push(APPLICATION_USER_CONSTANT.applicationUserSummariesNotifier$.subscribe(() => {
            this.reloadApplicationUsers();
            this.filterReleaseSummaries();
        }));
        this.subscriptions.push(RELEASE_CONSTANT.releaseSummariesNotifier$.subscribe(() => {
            this.loadReleases();
            this.filterReleaseSummaries();
        }));
        this.subscriptions.push(this.route.paramMap.subscribe(params => {
            this.appUser = params.get('appUser');
            this.reloadApplicationUsers();
            this.filterReleaseSummaries();
        }));
    }

    /**
      * Clean up subscriptions
      */
    ngOnDestroy(): void {
        this.subscriptions.forEach(sub => sub.unsubscribe);
    }

    private loadReleases(): void {
        this.releaseSummaries = Array.from(RELEASE_CONSTANT.releaseSummaries)
            .sort((ra, rb) => rb.versionNumber.localeCompare(ra.versionNumber));
    }

    private reloadApplicationUsers(): void {
        this.applicationUser = APPLICATION_USER_CONSTANT.applicationUserSummaries.find(au => au && au.name === this.appUser);
    }

    private filterReleaseSummaries(): void {
        const filtered = this.releaseSummaries.filter(rs =>
            this.applicationUser && rs && rs.applicationUserIds && rs.applicationUserIds.indexOf(this.applicationUser.id) > -1
        );
        this.filteredReleaseSummaries = filtered;
    }

}
