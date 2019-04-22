import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PatchImportComponent } from './patch-import.component';

describe('PatchImportComponent', () => {
  let component: PatchImportComponent;
  let fixture: ComponentFixture<PatchImportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PatchImportComponent ]
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
