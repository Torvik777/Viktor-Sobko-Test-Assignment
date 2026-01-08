import { TestBed } from '@angular/core/testing';

import { UserTabsApiService } from './user-tabs-api.service';

describe('UserTabsApiService', () => {
  let service: UserTabsApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserTabsApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
