import { TestBed } from '@angular/core/testing';

import { GoongService } from './goong.service';

describe('GoongService', () => {
  let service: GoongService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GoongService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
