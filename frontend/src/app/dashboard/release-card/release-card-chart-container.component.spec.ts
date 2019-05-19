import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReleaseCardNoChartDataComponent } from './release-card-no-chart-data.component';

describe('ReleaseCardNoChartDataComponent', () => {
  let component: ReleaseCardNoChartDataComponent;
  let fixture: ComponentFixture<ReleaseCardNoChartDataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReleaseCardNoChartDataComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReleaseCardNoChartDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
