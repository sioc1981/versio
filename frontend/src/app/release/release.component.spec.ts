import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReleaseComponent } from './release.component';
import { AppModule } from '../app.module';

describe('ReleaseComponent', () => {
  let component: ReleaseComponent;
  let fixture: ComponentFixture<ReleaseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
        imports: [
            AppModule
        ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReleaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
