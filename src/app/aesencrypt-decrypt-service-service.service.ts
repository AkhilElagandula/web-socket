import { Injectable } from '@angular/core';
import * as crypto from 'crypto-js';
@Injectable({
  providedIn: 'root'
})
export class AESEncryptDecryptServiceServiceService {

  constructor() { }
  secretKey = "8080808080808080";
  encrypt(value : string) : string{
    return crypto.AES.encrypt(value, this.secretKey.trim()).toString();
  }
  // decrypt(value:string){
  //   let decryptText = crypto.AES.decrypt(value, this.secretKey.trim());
  //   console.log(decryptText.toString(crypto.enc.Utf8))
  //   return decryptText.toString(crypto.enc.Utf8);
  // }
  
}
