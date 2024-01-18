import { Injectable } from '@angular/core';
import { inflate, deflate } from 'pako';
import { Observable, Subject } from 'rxjs';
declare var Zlib: any;
var baOldData:any = [];
@Injectable({
  providedIn: 'root'
})
export class OdinwebsocketserviceService {

  public ws!: WebSocket;
  private initialized = false;

  public socketSubject: Subject<any> = new Subject<any>();
  public socketData$: Observable<any> = this.socketSubject.asObservable();
  public connectionErrorSubject: Subject<any> = new Subject<any>();
  public connectionError$: Observable<any> = this.connectionErrorSubject.asObservable();
  private websocketConnected = false;
  retval = false;
  baRequest: any;
  websocketAttempt = 0;
  SubscribeScript = '';
  UnsubscribeScript = '';
  tempWSData = [];
  // baOldData = [];  
  WSDataLength = 0;
  reconnectAttempts= 1;
  maxReconnectAttempts = 5;
  maxReconnectDelay = 16000;
  currentReconnectDelay = 3000;
  reconnectAttempt=0 ;
  maxReconnectAttempt  = 25;
  reconnectTimer:any;
  prefixRequest = "63=FT3.0";
  requestType: any;
  requestData: any = "";
  postfixRequest = "4=1000|230=1";
  feedResponse: any;
  feedData:any;
  constructor() {
    this.initializeWebSocket();
  }
  public CgScrip:any = {   
  }
  public initializeWebSocket() {
    // if (!this.initialized) {
      try {
      const timestamp = new Date().getTime();
      // this.ws = new WebSocket(`wss://cmwssn.religareonline.com:443?timestamp=${timestamp}`);
      // this.ws = new WebSocket('wss://feed.religare.odinwave.com:443')
      this.ws = new WebSocket('wss://feed.religarebroking.com:443');
      // console.log('WS:',this.ws);
      this.ws.binaryType = 'arraybuffer';
      // console.log(this.ws.readyState);
      this.ws.onopen = (event) => {
        this.initialized = true;
        this.SubscribeCall();
      };

      this.ws.onmessage = (event) => {
        // console.log('onMessage:', event);
        this.handleMessage(event);
      };

      this.ws.onclose = (event) => {
        this.onWebsocketClose();
      };

      this.ws.onerror = (event) => {
        // console.error('WebSocket Error:', event);
        this.handleError(event);
      };
    }
      catch(exception) {
        console.log(exception);
      }
    // }
  }
  public handleError(error: any): void {
    console.error('WebSocket error:', error);
    this.connectionErrorSubject.next(error);
  }

  public handleMessage(event: MessageEvent) {
    const received_msg = event.data;
    const compdata = new Uint8Array(received_msg);
    // console.log('compDate:',compdata)
    this.UnCompressData_Single(compdata);
  }

  public reconnectToWebSocket() {
    setTimeout(() => {
      this.initializeWebSocket();
    });
  }

  public onWebsocketClose() {
    // this.ws = null;
    this.initialized = false;
    console.log('WebSocket closed. Reconnecting...');
    if (this.reconnectAttempts <= this.maxReconnectAttempts) {
    this.reconnectToWebSocket();
    }
    this.reconnectAttempts++;
  }

  public webSocketConnect(eventName:any, dataList:any): Observable<any> {
    this.postfixRequest = "4=1000|230=1";
    this.retval = false;
    this.requestType = eventName;
    const data = dataList;
    this.requestData = "";
    data.forEach((element:any) => {
      this.requestData += "1=" + element.split('-')[0] + "$7=" + element.split('-')[1] + '|';
    });

    // if (!this.ws || this.ws.readyState !== 1) {
      this.initializeWebSocket();
    // } 
    return this.socketData$;
  }
  SubscribeCall() {    
    var initialCall = this.prefixRequest + '|64=' + this.requestType + '|65=80|' + this.requestData + this.postfixRequest;
    console.log('RequestString:',initialCall);
    this.ws.send(this.sendData(initialCall));
  }
  sendData(strRequest: string) {
    const strHead = String.fromCharCode(5); // 5 compression char
    let i;
    let data = new ArrayBuffer(strHead.length);
    let headerBytes = new Uint8Array(data);
    for (i = 0; i < strHead.length; i += 1) {
      headerBytes[i] = strHead.charCodeAt(i);
    }
    const baRequest:any = this.CompressData(strRequest);
    // console.log('compress Data',baRequest);
    let length = baRequest.length;
    length += 4;
    const lenLength = length.toString().length;
    let lengthString = "";
    for (i = 0; i < (5 - lenLength); i++) {
      lengthString += "0";
    }
    lengthString += length.toString();
    data = new ArrayBuffer(lengthString.length);
    const lenBytes = new Uint8Array(data);
    for (i = 0; i < lengthString.length; i += 1) {
      lenBytes[i] = lengthString.charCodeAt(i);
    }
    const baActualSend = new Uint8Array(5 + length);
    baActualSend.set(lenBytes);
    baActualSend.set(baRequest, 5);
    const outputStream = new Uint8Array(headerBytes.length + baActualSend.length);
    outputStream.set(headerBytes);
    outputStream.set(baActualSend, 1);
    return outputStream.buffer;
  }

  // passsocketData(compdata) {
  //   if(this.CgScrip)
  //   return this.CgScrip;
  // }
  UnCompressData_Single(data:any) {
    var compdata = new Uint8Array(data);
    // console.log('onMessage string Data', compdata);
    try {
      var baProcessData = null;
      var intRawPktLen;
      var intCompLen = 0;
      var _response, isBroken = false;
      var totalPacketLength = 0;
      var dataReceived:any = null;
      var dataPacketLengthList = [];
      var feed= '';
        if (baOldData == null || baOldData.length == 0)
            dataReceived = new Uint8Array(compdata);
        else {
            dataReceived = this.AppendOrCopyBuffer(baOldData, compdata);
            baOldData = null;
        }

        intRawPktLen = dataReceived.byteLength;
        var i = 0;
        if (intRawPktLen > 5) {
            while (i < intRawPktLen) {
                if (dataReceived[i] == 5 || dataReceived[i] == 2) {
                    var strPacketLength = String.fromCharCode.apply(null, dataReceived.subarray(i + 1, i + 6));
                    if (strPacketLength.length == 5) {
                        var packetLength = parseInt(strPacketLength, 10);
                        dataPacketLengthList.push(packetLength + 6);
                        totalPacketLength += packetLength + 6;
                        i = i + 6 + packetLength;
                    }
                    else {
                        baOldData = dataReceived.subarray(i, intRawPktLen);
                        isBroken = true;
                        break;
                    }
                }
                else {                   	
                    break;
                }
            }
        }
        else
            baOldData = dataReceived;
			// equal packet length
        if (intRawPktLen == totalPacketLength) {          
            for (var i = 0, j = 0, k = dataPacketLengthList[0], len = dataPacketLengthList.length; i < len ; i++) {
                var uncompData = dataReceived.subarray(j, k);
                feed =this.ProcessSocketMessage(uncompData);
                j = k;
                k = k + dataPacketLengthList[i + 1];
            }
            baOldData = null;
        }
        else {
            var i = 0, j = 0;
            var k = (dataPacketLengthList.length > 0 ? dataPacketLengthList[0] : 0);

            if (!isBroken) {
                for (var len = dataPacketLengthList.length ; i < len - 1; i++) {
                    var uncompData = dataReceived.subarray(j, k);
                   feed = this.ProcessSocketMessage(uncompData);
                    j = k;
                    k = k + dataPacketLengthList[i + 1];
                }

                if (i == dataPacketLengthList.length - 1) {
                    if (dataReceived.subarray(j, k)[0] != 5) {                      
                    }
                    baOldData = null;
                    baOldData = dataReceived.subarray(j, k);
                    if (baOldData[0] != 5 && baOldData[0] != 2) {                       
                    }
                }
                else {                  
                }
            }
            else {
                for (var len = dataPacketLengthList.length; i < len; i++) {
                    var uncompData = dataReceived.subarray(j, k);
                   feed = this.ProcessSocketMessage(uncompData);

                    j = k;
                    k = k + dataPacketLengthList[i + 1];
                }
                isBroken = false;
            }
        }  
        
    }
    catch (e) {      
    }
  }
  AppendOrCopyBuffer(buffer1:any, buffer2:any) {
    var tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
    tmp.set(new Uint8Array(buffer1), 0);
    tmp.set(new Uint8Array(buffer2), buffer1.byteLength);
    return tmp;
  }
  ProcessSocketMessage(uncompData:any) {
    var _response = this.DeCompressData(uncompData);
    // console.log('decompressed Data',_response);
    this.feedResponse = this.parseCompactFeedData1(_response);
    return this.feedResponse;
  }

  parseCompactFeedData1(message:any) {
    console.log('',message);     
      let scripData = message.split('|');
      // console.log(scripData);
      for (let data of scripData) {
        if (data === '') continue;
        let val = data.trim().split('=');
        switch (val[0]) {
          case '1':
            this.CgScrip.SID = parseInt(val[1]);
            break; // segId
          case '7':
            this.CgScrip.TN = parseInt(val[1]);
            break; // tokenNo
          case '8':
            this.CgScrip.LTP = parseFloat(val[1]);
            break; // LTP: Last Traded Price
          case '74':
            this.CgScrip.LUT = val[1];
            this.CgScrip.LTT = val[1];
            break; // PC: Last Traded Time
          case '76':
            this.CgScrip.PC = parseFloat(val[1]);
            break; // PC: Prev Close
          case '399':
            this.CgScrip.DL = parseInt(val[1]);
            break; // DL: Decimal Locator
          case '393':
            this.CgScrip.CV = parseFloat(val[1]);
            break; // DL: Decimal Locator
          case '54':
            this.CgScrip.CP = parseFloat(val[1]);
            break; // DL: Decimal Locator
        }
      }
      this.CgScrip.KEY = this.CgScrip.SID + '-' + this.CgScrip.TN;
      let segmentToken = this.CgScrip.KEY.split('-');
      this.CgScrip.SID = parseInt(segmentToken[0]);
      this.CgScrip.TN = parseInt(segmentToken[1]);
    console.log('parsed Data',this.CgScrip);
    this.socketSubject.next(this.CgScrip);
    return this.CgScrip;
  }

  

  CompressData(sData:any) {
    ////compression
    var data = new ArrayBuffer(sData.length);
    var uint8buf = new Uint8Array(data);
    for (var i = 0; i < sData.length; i += 1) {
        uint8buf[i] = sData.charCodeAt(i) & 0xFF;
    }
    // var compData = Zlib.compress(new Uint8Array(data), 6);
    
    // var compData = deflate(new Uint8Array(data:any));
    var compData = deflate(new Uint8Array(data));
    return compData;
}
  DeCompressData(_pktData:any) {    
    try {
        var _compData = new Uint8Array(_pktData);      
        _compData = _compData.subarray(6, _compData.length);
        // var _uncompData = Zlib.uncompress(new Uint8Array(_compData));
        var _uncompData:any = inflate(new Uint8Array(_compData));
        var _sResp = [];
        for (var i = 0, len = _uncompData.length; i < len; i += 1) {
            _sResp.push(String.fromCharCode(_uncompData[i]));
        }
        return _sResp.join('');
    }
    catch (e) {      
    }
    return;
}

  UnSubscribeFeed(eventName:any, dataList:any) {
    // console.log('Inside unsubsceibed feed',this.ws.readyState);
    this.requestType = eventName;
    let data = dataList;
    // console.log(this.requestData);
    data.map((element:any) => {
      this.requestData += "1=" + element.split('-')[0] + "$7=" + element.split('-')[1] + '|';
    });
    this.postfixRequest = "|4=1000|230=2";
    var unscubcribeCall = this.prefixRequest + '|64=' + this.requestType + '|65=10|' + this.requestData + this.postfixRequest;
    this.ws.send(this.sendData(unscubcribeCall));
    setTimeout(()=> {
      // console.log(this.ws.readyState);
    },1000)
    
    this.requestData = '';
  }

  // reconnectToWebsocket() {

  //   this.SubscribeCall();
  // }
  // private handleWebSocketMessage(data: any) {
  //   // Handling incoming WebSocket data, e.g., decompression and processing
  // }
}
