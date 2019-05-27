import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PatchComponent } from './patch.component';
import { AppModule } from '../app.module';

describe('PatchComponent', () => {
  let component: PatchComponent;
  let fixture: ComponentFixture<PatchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
        imports: [
            AppModule
        ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PatchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
