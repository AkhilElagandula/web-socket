import { TestBed } from '@angular/core/testing';

import { AESEncryptDecryptServiceServiceService } from './aesencrypt-decrypt-service-service.service';

describe('AESEncryptDecryptServiceServiceService', () => {
  let service: AESEncryptDecryptServiceServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AESEncryptDecryptServiceServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
