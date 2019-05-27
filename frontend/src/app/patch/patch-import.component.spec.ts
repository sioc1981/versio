import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PatchImportComponent } from './patch-import.component';
import { AppModule } from '../app.module';

describe('PatchImportComponent', () => {
  let component: PatchImportComponent;
  let fixture: ComponentFixture<PatchImportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
        imports: [
            AppModule
        ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PatchImportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
