/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { WktComponent } from './wkt.component';

describe('WktComponent', () => {
  let component: WktComponent;
  let fixture: ComponentFixture<WktComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WktComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WktComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
