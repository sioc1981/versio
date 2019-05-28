import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReleaseUpdateComponent } from './release-update.component';
import { AppModule } from '../app.module';
import { ReleaseFull } from './shared/release.model';

describe('ReleaseUpdateComponent', () => {
  let component: ReleaseUpdateComponent;
  let fixture: ComponentFixture<ReleaseUpdateComponent>;

  const releaseFull: ReleaseFull = {
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
    issues: [],
    patches: []
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
    fixture = TestBed.createComponent(ReleaseUpdateComponent);
    component = fixture.componentInstance;
    component.release = releaseFull;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
