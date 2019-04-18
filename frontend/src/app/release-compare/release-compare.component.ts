import { Component, OnInit, OnDestroy } from '@angular/core';
import { Release } from '../release/shared/Release';
import { ReleaseService } from '../release/shared/release.service';
import { ActivatedRoute } from '@angular/router';
import { ReleaseComparison } from '../release/shared/ReleaseComparison';
import { Subscription } from 'rxjs';
import { VersionGraphConfig } from './version-graph-config';

@Component({
    selector: 'app-release-compare',
    templateUrl: './release-compare.component.html',
    styleUrls: ['./release-compare.component.less']
})
export class ReleaseCompareComponent implements OnInit, OnDestroy {

    releases: Release[] = [];
    versionCompare: ReleaseComparison;

    fromVersion: string;
    toVersion: string;

    private subscriptions: Subscription[] = [];

    versionGrahConfig: VersionGraphConfig = {
        chartId: 'versionGraph',
        chartHeight: 200,
        axis: {
            x: {
                type: 'timeseries',
                tick: {
                    format: '%Y-%m-%d'
                }
            },
            y: {
                show: false
            }
        },
    };

    constructor(private releaseService: ReleaseService, private route: ActivatedRoute) { }

    ngOnInit() {
        this.route.paramMap.subscribe(params => {
            this.fromVersion = params.get('fromVersion');
            this.toVersion = params.get('toVersion');
            if ( params.has('fromVersion') && params.has('fromVersion')) {
                this.compare();
            }
        });
        this.getReleases();
    }

    /**
      * Clean up subscriptions
      */
    ngOnDestroy(): void {
        this.subscriptions.forEach(sub => sub.unsubscribe);
    }

    getReleases(): void {
        this.subscriptions.push(this.releaseService.getReleases()
            .subscribe(newReleases => this.releases = newReleases.sort(this.sortVersionNumber)));
    }

    sortVersionNumber(release1: Release, release2: Release): number {
        const aVersion = release1.version.versionNumber;
        const bVersion = release2.version.versionNumber;
        return bVersion.localeCompare(aVersion);
    }

    compare(): void {
        this.subscriptions.push(this.releaseService.compare(this.fromVersion, this.toVersion).subscribe(res => {
            this.versionCompare = res;
        }));
    }
}
