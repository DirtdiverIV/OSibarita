import { TestBed } from '@angular/core/testing';

import { FirebaseDiagnosticService } from './firebase-diagnostic.service';

describe('FirebaseDiagnosticService', () => {
  let service: FirebaseDiagnosticService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FirebaseDiagnosticService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
