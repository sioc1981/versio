import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PatchUpdateComponent } from './patch-update.component';
import { AppModule } from '../app.module';
import { Patch } from './shared/patch.model';

describe('PatchUpdateComponent', () => {
  let component: PatchUpdateComponent;
  let fixture: ComponentFixture<PatchUpdateComponent>;
    const patch: Patch = {
        id: 1,
        release: {
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
        },
        sequenceNumber: '1',
        buildDate: new Date(),
        packageDate: null,
        qualification: null,
        keyUser: null,
        pilot: null,
        production: null,
        issues: []
    };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
        imports: [
            AppModule
        ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PatchUpdateComponent);
    component = fixture.componentInstance;
    component.patch = patch;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
