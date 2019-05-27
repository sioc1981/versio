import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PatchCreateComponent } from './patch-create.component';
import { AppModule } from '../app.module';

describe('PatchCreateComponent', () => {
  let component: PatchCreateComponent;
  let fixture: ComponentFixture<PatchCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
        imports: [
            AppModule
        ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PatchCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
