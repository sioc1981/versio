import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VersionCreateComponent } from './version-create.component';

describe('VersionCreateComponent', () => {
  let component: VersionCreateComponent;
  let fixture: ComponentFixture<VersionCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VersionCreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VersionCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
