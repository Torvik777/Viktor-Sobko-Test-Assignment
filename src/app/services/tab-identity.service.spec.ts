import { TestBed } from '@angular/core/testing';

import { TabIdentityService } from './tab-identity.service';

describe('TabIdentityService', () => {
  let service: TabIdentityService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TabIdentityService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
