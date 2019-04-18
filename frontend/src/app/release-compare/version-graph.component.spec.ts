import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VersionGraphComponent } from './version-graph.component';

describe('VersionGraphComponent', () => {
  let component: VersionGraphComponent;
  let fixture: ComponentFixture<VersionGraphComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VersionGraphComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VersionGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
