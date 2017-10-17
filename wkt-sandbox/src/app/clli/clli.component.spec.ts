/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ClliComponent } from './clli.component';

describe('ClliComponent', () => {
  let component: ClliComponent;
  let fixture: ComponentFixture<ClliComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClliComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClliComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
