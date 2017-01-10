/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { PicSimEmscriptenService } from './pic-sim-emscripten.service';

describe('PicSimEmscriptenService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PicSimEmscriptenService]
    });
  });

  it('should ...', inject([PicSimEmscriptenService], (service: PicSimEmscriptenService) => {
    expect(service).toBeTruthy();
  }));
});
