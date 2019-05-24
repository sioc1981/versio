import { Component, OnInit, Input, Output, EventEmitter, DoCheck, Host } from '@angular/core';

import { cloneDeep, defaultsDeep, isEqual, merge, uniqueId } from 'lodash';

import { ChartBase, ChartDefaults } from 'patternfly-ng';
import { VersionGraphConfig } from './version-graph-config.model';
import { ReleaseCompareComponent } from './release-compare.component';
import { ReleaseComparison } from '../release/shared/release.model';

@Component({
    selector: 'app-version-graph',
    templateUrl: './version-graph.component.html',
    styleUrls: ['./version-graph.component.less']
})
export class VersionGraphComponent extends ChartBase implements OnInit, DoCheck {
    releaseCompareComponent: ReleaseCompareComponent;

    @Input() releaseComparison: ReleaseComparison;


    /**
     * Configuration object containing details about how to render the chart
     */
    @Input() config: VersionGraphConfig;

    @Output() chartLoaded: EventEmitter<any> = new EventEmitter();

    // Store the chart object
    private graphConfig: VersionGraphConfig;

    private defaultConfig: VersionGraphConfig;
    private prevReleaseComparison: ReleaseComparison;
    private prevConfig: VersionGraphConfig;

    constructor(protected chartDefaults: ChartDefaults, @Host() releaseCompareComponent: ReleaseCompareComponent) {
        super();
        this.releaseCompareComponent = releaseCompareComponent;
    }

    ngOnInit() {
        this.setupConfigDefaults();
        this.setupConfig();
        this.generateChart(this.config, true);

    }

    /**
 * Check if the component config has changed
 */
    ngDoCheck(): void {
        const dataChanged = !isEqual(this.releaseComparison, this.prevReleaseComparison);
        if (dataChanged || !isEqual(this.config, this.prevConfig)) {
            this.setupConfig();
            this.generateChart(this.config, true);
        }
    }
    /**
     * Set up default config
     */
    protected setupConfig(): void {
        this.config = cloneDeep(this.defaultConfig);

        /*
         * Setup Axis options. Default is to not show either axis. This can be overridden in two ways:
         *   1) in the config, setting showAxis to true will show both axes
         *   2) in the attributes showXAxis and showYAxis will override the config if set
         *
         * By default only line and the tick marks are shown, no labels. This is a sparkline and should be used
         * only to show a brief idea of trending. This can be overridden by setting the config.axis options per C3
         */
        this.config.axis.y.show = false;
        if (this.config.chartHeight !== undefined) {
            this.config.size.height = this.config.chartHeight;
        }


        this.config.data = this.getChartData();
        this.prevConfig = cloneDeep(this.config);
        this.prevReleaseComparison = cloneDeep(this.releaseComparison);
    }

    /**
     * Set up config defaults
     */
    protected setupConfigDefaults(): void {
        this.defaultConfig = this.chartDefaults.getDefaultLineConfig();


        this.defaultConfig.axis = {
            x: {
                show: true,
                type: 'timeseries',
                tick: {
                    format: '%Y-%m-%d'
                }
            },
            y: {
                show: false,
            }
        };
        this.defaultConfig.grid = {
            x: {
                show: false
            },
            y: {
                show: false
            }
        };
        this.defaultConfig.chartId = uniqueId(this.config.chartId);
        this.defaultConfig.data = { columns: [] };
        this.defaultConfig.tooltip = this.tooltip();
        this.defaultConfig.units = '';
        this.defaultConfig.size = { height: 150 };
    }

    tooltip(): any {
        return {
            format: {
                value: this.getTooltipValueFormat()
            },
            grouped: false
        };
    }

    // Private

    private getTooltipValueFormat() {
        return (value, ratio, id, index) => {
            return id === this.releaseCompareComponent.fromVersion ?
                this.releaseComparison.sourceReleases[index].version.versionNumber :
                this.releaseComparison.destReleases[index].version.versionNumber;
        };
    }

    protected getChartData(): any {
        const data: any = { columns: [] };

        if (this.releaseComparison) {
            data.xs = {};
            data.xs[this.addQuote(this.releaseCompareComponent.fromVersion)] = 'xFrom';
            data.xs[this.addQuote(this.releaseCompareComponent.toVersion)] = 'xTo';
            data.columns = [
                this.generateXdata(true),
                this.generateXdata(false),
                this.generateYdata(true),
                this.generateYdata(false)
            ];
            data.colors = {};
            data.colors[this.addQuote(this.releaseCompareComponent.fromVersion)] = '#ff8000';
            data.colors[this.addQuote(this.releaseCompareComponent.toVersion)] = '#40b000';

        }
        return data;
    }

    private addQuote(s: string): string {
        return s;
    }

    private generateYdata(isFrom: boolean): any[] {
        const res: any[] = [];
        const releases = isFrom ? this.releaseComparison.sourceReleases : this.releaseComparison.destReleases;
        res.push(this.addQuote(isFrom ? this.releaseCompareComponent.fromVersion : this.releaseCompareComponent.toVersion));
        if (this.releaseCompareComponent.fromVersion.substring(0, this.releaseCompareComponent.fromVersion.lastIndexOf('.')) ===
            this.releaseCompareComponent.toVersion.substring(0, this.releaseCompareComponent.toVersion.lastIndexOf('.'))) {
            releases.forEach(_ => res.push(1));
        } else {
            releases.forEach(r => res.push(r.version.versionNumber.split('.').length === 3 ? 0 : (isFrom ? -1 : 1)));
        }
        return res;
    }

    private generateXdata(isFrom: boolean): any[] {
        const res: any[] = [];
        const releases = isFrom ? this.releaseComparison.sourceReleases : this.releaseComparison.destReleases;
        res.push(isFrom ? 'xFrom' : 'xTo');
        releases.forEach(r => res.push(r.buildDate));
        return res;
    }

}
