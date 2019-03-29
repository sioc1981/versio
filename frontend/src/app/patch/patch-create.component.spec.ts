import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PatchCreateComponent } from './patch-create.component';

describe('PatchCreateComponent', () => {
  let component: PatchCreateComponent;
  let fixture: ComponentFixture<PatchCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PatchCreateComponent ]
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
