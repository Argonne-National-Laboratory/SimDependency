/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { WktService } from './wkt.service';

describe('WktService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [WktService]
    });
  });

  it('should ...', inject([WktService], (service: WktService) => {
    expect(service).toBeTruthy();
  }));
});
