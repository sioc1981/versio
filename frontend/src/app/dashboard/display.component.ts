import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { UtilizationDonutChartConfig } from 'patternfly-ng';
import { Subscription } from 'rxjs';
import { ReleaseSummary } from '../release/shared/release.model';
import { RELEASE_CONSTANT } from '../release/shared/release.constant';
import { ApplicationUser } from '../admin/applicationuser/shared/application-user.model';
import { APPLICATION_USER_CONSTANT } from '../admin/applicationuser/shared/application-user.constant';

@Component({
    encapsulation: ViewEncapsulation.None,
    selector: 'app-dashboard-display',
    templateUrl: './display.component.html',
    styleUrls: ['./display.component.less']
})
export class DisplayComponent implements OnInit, OnDestroy {

    releaseSummaries: ReleaseSummary[] = [];
    applicationUsers: ApplicationUser[] = [];
    releaseSummariesByApplicationUsers: ReleaseSummary[][] = [];

    activeSlideIndex = 0;
    activeApplicationUser: ApplicationUser = null;

    interval = 5000;

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
        this.reloadApplicationUsers();
        this.releaseSummaries = this.loadReleases();
        this.dispatchReleaseSummariesByApplicationUsers();
        this.subscriptions.push(APPLICATION_USER_CONSTANT.applicationUserSummariesNotifier$.subscribe(() => {
            this.reloadApplicationUsers();
            this.dispatchReleaseSummariesByApplicationUsers();
        }));
        this.subscriptions.push(RELEASE_CONSTANT.releaseSummariesNotifier$.subscribe(() => {
            this.releaseSummaries = this.loadReleases();
            this.dispatchReleaseSummariesByApplicationUsers();
        }));
    }

    private loadReleases(): ReleaseSummary[] {
        if(this.applicationUsers.length > 0) {
            this.activeApplicationUser = this.applicationUsers[this.activeSlideIndex]; 
        }
        return Array.from(RELEASE_CONSTANT.releaseSummaries).sort((ra, rb) => rb.versionNumber.localeCompare(ra.versionNumber));
    }

    private reloadApplicationUsers(): void {
        if (this.applicationUsers.length > 0) {
            this.activeApplicationUser = this.applicationUsers[this.activeSlideIndex]; 
        }
        this.applicationUsers = Array.from(APPLICATION_USER_CONSTANT.applicationUserSummaries)
            .filter(au => au !== undefined)
            .sort((aua, aub) => aua.name.localeCompare(aub.name));
    }

    private dispatchReleaseSummariesByApplicationUsers(): void {
        const summariesByApplicationUsers: ReleaseSummary[][] = [];
        const currentApplicationUserIndex = this.applicationUsers.findIndex(au => au && this.activeApplicationUser 
            && au.id === this.activeApplicationUser.id);
        this.applicationUsers.forEach((ap, index) => {
            summariesByApplicationUsers[index] = this.releaseSummaries.filter(rs =>
                rs && rs.applicationUserIds && rs.applicationUserIds.indexOf(ap.id) > -1
            );
        });
        this.releaseSummariesByApplicationUsers = summariesByApplicationUsers;
        this.activeSlideIndex = currentApplicationUserIndex !== -1 ? currentApplicationUserIndex : 0;
    }

    /**
      * Clean up subscriptions
      */
    ngOnDestroy(): void {
        this.subscriptions.forEach(sub => sub.unsubscribe);
    }

}
