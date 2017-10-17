/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { CriticalinfrastructurelayerService } from './criticalinfrastructurelayer.service';

describe('CriticalinfrastructurelayerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CriticalinfrastructurelayerService]
    });
  });

  it('should ...', inject([CriticalinfrastructurelayerService], (service: CriticalinfrastructurelayerService) => {
    expect(service).toBeTruthy();
  }));
});
