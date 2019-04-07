import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PatchUpdateComponent } from './patch-update.component';

describe('PatchUpdateComponent', () => {
  let component: PatchUpdateComponent;
  let fixture: ComponentFixture<PatchUpdateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PatchUpdateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PatchUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
