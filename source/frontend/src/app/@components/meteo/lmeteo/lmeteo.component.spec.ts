import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LmeteoComponent } from './lmeteo.component';

describe('LmeteoComponent', () => {
  let component: LmeteoComponent;
  let fixture: ComponentFixture<LmeteoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LmeteoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LmeteoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
