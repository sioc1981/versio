import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServerEventComponent } from './server-event.component';

describe('ServerEventComponent', () => {
  let component: ServerEventComponent;
  let fixture: ComponentFixture<ServerEventComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ServerEventComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServerEventComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
