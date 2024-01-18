import { TestBed } from '@angular/core/testing';

import { OdinwebsocketserviceService } from './odinwebsocketservice.service';

describe('OdinwebsocketserviceService', () => {
  let service: OdinwebsocketserviceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OdinwebsocketserviceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
