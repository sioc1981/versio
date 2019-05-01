import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { InfoStatusCardConfig, UtilizationDonutChartConfig } from 'patternfly-ng';
import { RELEASE_CONSTANT } from '../release/shared/release.service';
import { PATCH_CONSTANT } from '../patch/shared/patch.service';
import { of, Subscription } from 'rxjs';
import { ReleaseSummary } from '../release/shared/ReleaseSummary';
import { ISSUE_CONSTANT } from '../issue/shared/issue.constant';

@Component({
    encapsulation: ViewEncapsulation.None,
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {


    issueConfig: InfoStatusCardConfig = this.getIssueCardConfig();
    patchConfig: InfoStatusCardConfig = this.getPatchCardConfig();
    releaseConfig: InfoStatusCardConfig = this.getReleaseCardConfig();

    releaseSummaries: ReleaseSummary[] = []; //RELEASE_CONSTANT.releaseSummaries;

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
        this.subscriptions.push(ISSUE_CONSTANT.summary.count$.subscribe(() => this.issueConfig = this.getIssueCardConfig()));
        this.subscriptions.push(PATCH_CONSTANT.summary.count$.subscribe(() => this.patchConfig = this.getPatchCardConfig()));
        this.subscriptions.push(RELEASE_CONSTANT.summary.count$.subscribe(() => this.releaseConfig = this.getReleaseCardConfig()));
        this.subscriptions.push(RELEASE_CONSTANT.releaseSummariesNotifier$.subscribe(() => {
             this.releaseSummaries = [].concat(RELEASE_CONSTANT.releaseSummaries);
        }));
    }
    /**
      * Clean up subscriptions
      */
    ngOnDestroy(): void {
        this.subscriptions.forEach(sub => sub.unsubscribe);
    }

    private getIssueCardConfig(): InfoStatusCardConfig {
        return {
            showTopBorder: true,
            htmlContent: true,
            title: ISSUE_CONSTANT.title,
            href: '#' + ISSUE_CONSTANT.url,
            iconStyleClass: ISSUE_CONSTANT.iconStyleClass,
            info: [
                'number of issues: ' + ISSUE_CONSTANT.summary.count,
            ]
        };
    }
    private getPatchCardConfig(): InfoStatusCardConfig {
        return {
            showTopBorder: true,
            htmlContent: true,
            title: PATCH_CONSTANT.title,
            href: '#' + PATCH_CONSTANT.url,
            iconStyleClass: PATCH_CONSTANT.iconStyleClass,
            info: [
                'number of patches: ' + PATCH_CONSTANT.summary.count,
            ]
        };
    }

    private getReleaseCardConfig(): InfoStatusCardConfig {
        return {
            showTopBorder: true,
            htmlContent: true,
            title: RELEASE_CONSTANT.title,
            href: '#' + RELEASE_CONSTANT.url,
            iconStyleClass: RELEASE_CONSTANT.iconStyleClass,
            info: [
                'number of releases: ' + RELEASE_CONSTANT.summary.count,
            ]
        };
    }

}
