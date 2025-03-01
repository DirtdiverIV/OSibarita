import { TestBed } from '@angular/core/testing';

import { VistasService } from './vistas.service';

describe('VistasService', () => {
  let service: VistasService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VistasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
