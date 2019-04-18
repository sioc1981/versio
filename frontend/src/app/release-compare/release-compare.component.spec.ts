import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReleaseCompareComponent } from './release-compare.component';

describe('ReleaseCompareComponent', () => {
  let component: ReleaseCompareComponent;
  let fixture: ComponentFixture<ReleaseCompareComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReleaseCompareComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReleaseCompareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
