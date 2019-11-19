import { Component, OnInit, Input } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { CardConfig, UtilizationDonutChartConfig, DonutChartConfig, EmptyStateConfig } from 'patternfly-ng';
import { ReleaseSummary } from 'src/app/release/shared/release.model';
import { PlatformSummary } from 'src/app/shared/platform.model';
import { ApplicationUser } from 'src/app/admin/applicationuser/shared/application-user.model';
import { APPLICATION_USER_CONSTANT } from 'src/app/admin/applicationuser/shared/application-user.constant';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-release-card',
    templateUrl: './release-card.component.html',
    styleUrls: ['./release-card.component.less']
})
export class ReleaseCardComponent implements OnInit {

    @Input()
    item: ReleaseSummary;

    @Input()
    showApplicationUsers = true;

    config: CardConfig;

    packageConfig: UtilizationDonutChartConfig;
    issueConfig: DonutChartConfig;
    issueData: any[] = [
        ['Release', 15],
        ['Patch', 5]
    ];

    applicationUsers: ApplicationUser[] = [];

    qualificationConfig: DonutChartConfig;
    qualificationData: any[] = this.generateEmptyData();
    keyUserConfig: DonutChartConfig;
    keyUserData: any[] = this.generateEmptyData();
    pilotConfig: DonutChartConfig;
    pilotData: any[] = this.generateEmptyData();
    productionConfig: DonutChartConfig;
    productionData: any[] = this.generateEmptyData();

    emptyStateConfig: EmptyStateConfig;

    maxPatch: number;

    chartHeight = 100;

    patchThreshold = 50;

    private subscriptions: Subscription[] = [];
    constructor(private router: Router) { }

    ngOnInit() {
        this.config = {
            // noPadding: true,
            // topBorder: false
        } as CardConfig;
        this.maxPatch = this.item.patchCount > this.patchThreshold ? this.item.patchCount : this.patchThreshold;
        this.packageConfig = {
            chartId: 'exampleUtilizationDonut' + this.item.id,
            centerLabelFormat: 'none',
            centerLabel: ' ',
            data: {
                onclick: (data, element) => {
                    const extra = {queryParams:{'view': 'PATCHES'} } as NavigationExtras;
                    this.router.navigate(['/release', this.item.versionNumber], extra);
                }
            },
            legend: {
                show: false
            },

            outerLabelAlignment: 'right',
            thresholds: { 'warning': 40, 'error': 80 },
            total: this.maxPatch,
            used: this.item.patchCount
        } as UtilizationDonutChartConfig;

        this.issueConfig = {
            chartId: 'IssueDonut' + this.item.id,
            colors: {
                release: '#3f9c35', // green
                patch: '#ec7a08'     // orange
            },
            centerLabel: ' ',
            chartHeight: 100,
            data: {
                names: {
                    available: 'Available',
                    validated: 'Deployed and validated',
                    deployed: 'Deployed and need validation',
                    missing: 'Not yet deployed'
                }
            },
            legend: {
                show: false
            }
        } as DonutChartConfig;

        this.subscriptions.push(APPLICATION_USER_CONSTANT.applicationUserSummariesNotifier$.subscribe(() => {
             this.reloadApplicationUsers();
        }));
        this.reloadApplicationUsers();

        this.qualificationConfig = this.geratateConfig('qualification', this.item.qualification.deployed,
            this.item.qualification.undeployed);
        if (this.item.qualification.deployed && !this.item.qualification.undeployed) {
            this.qualificationData = this.generateData(this.item.qualification);
        }

        this.keyUserConfig = this.geratateConfig('keyUser', this.item.keyUser.deployed, this.item.keyUser.undeployed);
        if (this.item.keyUser.deployed && !this.item.keyUser.undeployed) {
            this.keyUserData = this.generateData(this.item.keyUser);
        }

        this.pilotConfig = this.geratateConfig('pilot', this.item.pilot.deployed, this.item.pilot.undeployed);
        if (this.item.pilot.deployed && !this.item.pilot.undeployed) {
            this.pilotData = this.generateData(this.item.pilot);
        }

        this.productionConfig = this.geratateConfig('production', this.item.production.deployed, this.item.production.undeployed);
        if (this.item.production.deployed && !this.item.production.undeployed) {
            this.productionData = this.generateData(this.item.production);
        }

        this.emptyStateConfig = {
            iconStyleClass: 'pficon-ok',
            info: 'This version has no patch... yet!',
            title: 'No Patch'
        } as EmptyStateConfig;
    }

    reloadApplicationUsers() {
        if (this.showApplicationUsers) {
            this.applicationUsers = this.item.applicationUserIds
                .filter(id => APPLICATION_USER_CONSTANT.applicationUserSummaries[id] !== undefined)
                .map(id => APPLICATION_USER_CONSTANT.applicationUserSummaries[id]);
        }
    }

    generateData(summary: PlatformSummary): any[] {
        return [
            ['missing', this.item.patchCount - summary.deployedPatchCount],
            ['deployed', summary.deployedPatchCount - summary.validedPatchCount],
            ['validated', summary.validedPatchCount]
        ];

    }

    generateEmptyData(): any[] {
        return [];

    }

    geratateConfig(platform: string, isDeployed: boolean, isUndeployed: boolean): DonutChartConfig {
        const chartId = platform + 'Donut' + this.item.id;
        return {
            chartId: chartId,
            colors: {
                available: '#bbbbbb',     // grey
                validated: '#3f9c35', // green
                deployed: '#ec7a08',     // orange
                missing: '#cc0000'      // red
            },
            centerLabel: ' ',
            chartHeight: this.chartHeight,
            data: {
                names: {
                    available: 'Available',
                    validated: 'Deployed and validated',
                    deployed: 'Deployed and need validation',
                    missing: 'Not yet deployed'
                },
                empty: {
                    label: {
                        text: !isDeployed ? 'Not deployed' : isUndeployed ? 'Undeployed' : 'No Patch'
                    }
                },
                onclick: (data, element) => {
                    const extra = {queryParams:{'view': 'PATCHES'} } as NavigationExtras;
                    let filterCriterium = '';
                    switch (data.id) {
                    case 'missing':
                        filterCriterium = 'missingOn_';
                        break;
                    case 'deployed':
                        filterCriterium = 'toTestOn_';
                        break;
                    case 'validated':
                        filterCriterium = 'deployedOn_';
                        break;
                    }
                    if ( filterCriterium !== '' ) {
                        extra.queryParams = {
							'view': 'PATCHES',
                            'filter': [filterCriterium + platform, 'onlyDeployed_onlyDeployed']
                        };
                    }
                    this.router.navigate(['/release', this.item.versionNumber], extra);
                }
            },
            legend: {
                show: false
            },
            size: {
                width: 175,
                height: 100
            }
            ,
            tooltip: {
                position: function (data, width, height, element) {
                    const chartOffsetX = document.querySelector('#' + chartId).getBoundingClientRect().left;
                    const chartWidth = document.querySelector('#' + chartId).getBoundingClientRect().width;
                    const graphOffsetX = document.querySelector('#' + chartId + ' g.c3-axis-y')
                        .getBoundingClientRect().right;
                    const tooltipWidth = document.querySelector('#' + chartId + ' .c3-tooltip-container')
                        .getBoundingClientRect().width;
                    const cy = element.getAttribute('cy');
                    const x = Math.floor(chartWidth / 2) - Math.floor(tooltipWidth / 2);
                    const position = { top: 0 , left: 0 };
                    switch (platform) {
                        case 'qualification':
                        position.left = 0;
                        position.top = cy - height;
                        break;
                        case 'keyUser':
                        position.left = x;
                        position.top = cy - height;
                        break;
                        case 'pilot':
                        position.left =  graphOffsetX - chartOffsetX - Math.floor(tooltipWidth / 2);
                        position.top = cy - height;
                        break;
                        case 'production':
                        position.left =  graphOffsetX - chartOffsetX - Math.floor(tooltipWidth / 2);
                        position.top = cy;
                        break;
                    }
                    return position;
                }
            }
        } as DonutChartConfig;
    }
}
