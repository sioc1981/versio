import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReleaseCardComponent } from './release-card.component';
import { AppModule } from 'src/app/app.module';
import { ReleaseSummary } from 'src/app/release/shared/release.model';

describe('ReleaseCardComponent', () => {
    let component: ReleaseCardComponent;
    let fixture: ComponentFixture<ReleaseCardComponent>;
    const releaseSummary: ReleaseSummary = {
        id: 1,
        versionNumber: '1.0.0.0',
        patchCount: 0,
        packagedPatches: 0,
        qualification: {
            deployed: false,
            validated: false,
            undeployed: false,
            deployedPatchCount: 0,
            validedPatchCount: 0
        },
        keyUser: {
            deployed: false,
            validated: false,
            undeployed: false,
            deployedPatchCount: 0,
            validedPatchCount: 0
        },
        pilot: {
            deployed: false,
            validated: false,
            undeployed: false,
            deployedPatchCount: 0,
            validedPatchCount: 0
        },
        production: {
            deployed: false,
            validated: false,
            undeployed: false,
            deployedPatchCount: 0,
            validedPatchCount: 0
        }
    };

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                AppModule
            ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ReleaseCardComponent);
        component = fixture.componentInstance;
        component.item = releaseSummary;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
