import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReleaseUpdateComponent } from './release-update.component';
import { AppModule } from '../app.module';

describe('ReleaseUpdateComponent', () => {
  let component: ReleaseUpdateComponent;
  let fixture: ComponentFixture<ReleaseUpdateComponent>;

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
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
