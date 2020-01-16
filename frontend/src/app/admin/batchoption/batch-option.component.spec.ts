import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BatchOptionComponent } from './batch-option.component';

describe('BatchOptionComponent', () => {
  let component: BatchOptionComponent;
  let fixture: ComponentFixture<BatchOptionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BatchOptionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BatchOptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
