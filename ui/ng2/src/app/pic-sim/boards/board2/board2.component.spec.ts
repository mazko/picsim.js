/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { Board2Component } from './board2.component';

describe('Board2Component', () => {
  let component: Board2Component;
  let fixture: ComponentFixture<Board2Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Board2Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Board2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
