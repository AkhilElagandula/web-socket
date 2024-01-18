import { TestBed } from '@angular/core/testing';

import { OdinwebsocketService } from './odinwebsocket.service';

describe('OdinwebsocketService', () => {
  let service: OdinwebsocketService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OdinwebsocketService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
