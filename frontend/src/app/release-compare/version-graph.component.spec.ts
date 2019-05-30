import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VersionGraphComponent } from './version-graph.component';
import { AppModule } from '../app.module';
import { ReleaseCompareComponent } from './release-compare.component';
import { VersionGraphConfig } from './version-graph-config.model';
import { ReleaseComparison } from '../release/shared/release.model';

describe('VersionGraphComponent', () => {
    let hostComponent: ReleaseCompareComponent;
    let hostFixture: ComponentFixture<ReleaseCompareComponent>;
    let component: VersionGraphComponent;
    let fixture: ComponentFixture<VersionGraphComponent>;

    const versionGrahConfig: VersionGraphConfig = {
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
    const releaseComparison: ReleaseComparison = {
        sourceReleases: [{
            id: 1,
            version: {
                id: 1,
                versionNumber: '1.0.0.0'
            },
            buildDate: new Date(),
            packageDate: null,
            qualification: null,
            keyUser: null,
            pilot: null,
            production: null
        }],
        destReleases: [{
            id: 1,
            version: {
                id: 1,
                versionNumber: '1.0.0.0'
            },
            buildDate: new Date(),
            packageDate: null,
            qualification: null,
            keyUser: null,
            pilot: null,
            production: null
        }]
    };

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                AppModule
            ],
            providers: [
                ReleaseCompareComponent
            ]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        hostFixture = TestBed.createComponent(ReleaseCompareComponent);
        hostComponent = hostFixture.componentInstance;
        fixture = TestBed.createComponent(VersionGraphComponent);
        component = fixture.componentInstance;
        component.releaseComparison = releaseComparison;
        component.config = versionGrahConfig;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
