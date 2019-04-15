import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReleaseUpdateComponent } from './release-update.component';

describe('ReleaseUpdateComponent', () => {
  let component: ReleaseUpdateComponent;
  let fixture: ComponentFixture<ReleaseUpdateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReleaseUpdateComponent ]
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
