import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReleaseCreateComponent } from './release-create.component';
import { AppModule } from '../app.module';

describe('ReleaseCreateComponent', () => {
  let component: ReleaseCreateComponent;
  let fixture: ComponentFixture<ReleaseCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
        imports: [
            AppModule
        ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReleaseCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
