import { Component, OnInit, Input } from '@angular/core';
import { CardConfig, UtilizationDonutChartConfig, DonutChartConfig } from 'patternfly-ng';
import { ReleaseSummary } from 'src/app/release/shared/ReleaseSummary';
import { PlatformSummary } from 'src/app/shared/PlatformSummary';

@Component({
    selector: 'app-release-card',
    templateUrl: './release-card.component.html',
    styleUrls: ['./release-card.component.less']
})
export class ReleaseCardComponent implements OnInit {

    @Input()
    item: ReleaseSummary;

    config: CardConfig;

    packageConfig: UtilizationDonutChartConfig;
    qualificationConfig: DonutChartConfig;
    qualificationData: any[] = [
        ['missing', 0],
        ['validated', 0],
        ['deployed', 0],
        ['available', 0]
    ];
    keyUserConfig: DonutChartConfig;
    keyUserData: any[] = [
        ['missing', 0],
        ['validated', 0],
        ['deployed', 0],
        ['available', 0]
    ];
    pilotConfig: DonutChartConfig;
    pilotData: any[] = [
        ['missing', 0],
        ['validated', 0],
        ['deployed', 0],
        ['available', 0]
    ];
    productionConfig: DonutChartConfig;
    productionData: any[] = [
        ['missing', 0],
        ['validated', 0],
        ['deployed', 0],
        ['available', 0]
    ];

    maxPatch: number;

    constructor() { }

    ngOnInit() {
        this.config = {
        } as CardConfig;

        // this.packageConfig.total = this.item.patchCount;
        // this.packageConfig.used = this.item.packagePatched;
        // this.packageConfig.thresholds = {'warning': this.packageConfig.total=this.item.patchCount-1,
        //  'error': this.packageConfig.total=this.item.patchCount-3};
        this.maxPatch = this.item.patchCount > 25 ? this.item.patchCount : 25;
        this.packageConfig = {
            chartId: 'exampleUtilizationDonut' + this.item.id,
            centerLabelFormat: 'txt-func',
            outerLabelAlignment: 'right',
            thresholds: { 'warning': 10, 'error': 20 },
            total: this.maxPatch,
            units: 'patch',
            used: this.item.patchCount
        } as UtilizationDonutChartConfig;
        this.packageConfig.centerLabelFn = () => {
            return {
                title: this.packageConfig.used,
                subTitle: 'Patches'
            };
        };

        this.qualificationConfig = this.geratateConfig('qualification', 'Qua');
        if (this.item.qualification.deployed) {
            this.qualificationData = this.generateData(this.item.qualification);
        }

        this.keyUserConfig = this.geratateConfig('keyUser', 'K.U.');
        if (this.item.keyUser.deployed) {
            this.keyUserData = this.generateData(this.item.keyUser);
        }

        this.pilotConfig = this.geratateConfig('pilot', 'Pil');
        if (this.item.pilot.deployed) {
            this.pilotData = this.generateData(this.item.pilot);
        }

        this.productionConfig = this.geratateConfig('production', 'Prod');
        if (this.item.production.deployed) {
            this.productionData = this.generateData(this.item.production);
        }

    }

    generateData(summary: PlatformSummary): any[] {
        return [
            ['missing', this.item.patchCount - summary.deployedPatchCount],
            ['deployed', summary.deployedPatchCount - summary.validedPatchCount],
            ['validated', summary.validedPatchCount],
            ['available', this.maxPatch - this.item.patchCount]
        ];

    }

    geratateConfig(platform: string, shortname: string): DonutChartConfig {
        return {
            chartId: platform + 'Donut' + this.item.id,
            colors: {
                available: '#bbbbbb',     // gray
                validated: '#3f9c35', // green
                deployed: '#ec7a08',     // orange
                missing: '#cc0000'      // red
            },
            centerLabel: shortname,
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
    }
}
