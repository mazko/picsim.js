/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { PicSimComponent } from './pic-sim.component';

describe('PicSimComponent', () => {
  let component: PicSimComponent;
  let fixture: ComponentFixture<PicSimComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PicSimComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PicSimComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
