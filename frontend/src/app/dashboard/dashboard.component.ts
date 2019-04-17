import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { InfoStatusCardConfig, UtilizationDonutChartConfig } from 'patternfly-ng';
import { RELEASE_CONSTANT } from '../release/shared/release.service';
import { ISSUE_CONSTANT } from '../issue/shared/issue.service';
import { PATCH_CONSTANT } from '../patch/shared/patch.service';
import { of } from 'rxjs';
import { ReleaseSummary } from '../release/shared/ReleaseSummary';

@Component({
    encapsulation: ViewEncapsulation.None,
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {


    issueConfig: InfoStatusCardConfig = this.getIssueCardConfig();
    patchConfig: InfoStatusCardConfig = this.getPatchCardConfig();
    releaseConfig: InfoStatusCardConfig = this.getReleaseCardConfig();

    releaseSummaries: ReleaseSummary[] = RELEASE_CONSTANT.releaseSummaries;

        packageConfig: UtilizationDonutChartConfig = {
    chartId: 'exampleUtilizationDonut',
    centerLabelFormat: 'used',
    outerLabelAlignment: 'right',
    thresholds: {'warning': 60, 'error': 80},
    total: 100,
    units: 'Package',
    used: 10
  };


    constructor() { }

    ngOnInit() {
        ISSUE_CONSTANT.summary.count$.subscribe(_ => this.issueConfig = this.getIssueCardConfig());
        PATCH_CONSTANT.summary.count$.subscribe(_ => this.patchConfig = this.getPatchCardConfig());
        RELEASE_CONSTANT.summary.count$.subscribe(_ => this.releaseConfig = this.getReleaseCardConfig());
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
