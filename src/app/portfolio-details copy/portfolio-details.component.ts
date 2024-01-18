import { Component, OnInit, Input, Output } from '@angular/core';
import { PortfolioService } from '../portfolio.service';
import * as CryptoJS from 'crypto-js';
import { ActivatedRoute, Params, Router } from "@angular/router";
// import { AESEncryptDecryptServiceServiceService } from '../aesencrypt-decrypt-service-service.service'
@Component({
  selector: 'app-portfolio-details',
  templateUrl: './portfolio-details.component.html',
  styleUrls: ['./portfolio-details.component.css']
})
export class PortfolioDetailsComponentTest implements OnInit {

  constructor(
    private _portfolioService: PortfolioService,
    public router: Router,
    public route: ActivatedRoute,
    // private _AESEncryptDecryptService: AESEncryptDecryptServiceServiceService,
  ) { }
  public portfolioData: any;
  public data: any = {
    segment: "SUM",
    Clid: "",
    year: "",
    type: "first"
  };
  tokensToSubscribe: any = [];
  uniqueArray: any = [];
  isSessionValid = true;
  public segmentData: any = [];
  public year: any;
  public type: any;
  public market: any = "OVERVIEW";
  timeupdated: any;
  totalInv: any;
  userId: any;
  sessionId: any;
  productWave = false;
  product: any;
  msg: any = "";
  uID: any;
  showMsg: any = false;
  tempKeys: any
  marketType: any = 'OVERVIEW'
  proceedToSegment = true;
  currentYear: any = new Date().getFullYear() - 1;
  overviewDataLength: any;
  portfolioYearList: any;
  overViewData1: any = [];
  segementActiveMF: any = false;
  segementActiveEQ: any = false;
  segementActiveCU: any = false;
  segementActiveCO: any = false;
  segementActiveDE: any = false;
  refetchDataCount: number = 1;
  maxrefetchAttempt = 4;
  refetchDataDelay = 15000;
  sectionTitle: any = "PORTFOLIO";
  dateDropDown: any = [];
  marketStatus2: any = [
    { label: "Open", value: "Z" },
    { label: "Closed", value: "P" },
  ];
  ngOnInit() {
    let finYear = this.getCurrentFinancialYear();
    this.dateDropDown = [{ label: finYear, value: finYear.split('-')[0] }];
    this.route.queryParams.subscribe((params: Params) => {
      this.userId = atob(params['u']);
      this.uID = this.encryption(this.userId);
      // this.userId=this.decryption(this.uID); 
      // console.log(this.userId, this.uID);
      this._portfolioService.app.database().ref("CG-PORTFOLIO-REQ/" + this.userId).update(
        {
          'CG': 'CG',
          'PLATFORM': 'Web',
          'TS': new Date().getTime()
        }
      );
    });
    this.market = "OVERVIEW";
    this._portfolioService.getYears(this.userId)
      .subscribe((body: any) => {
        var data = [];
        this.dateDropDown.splice(0, 1);
        data = Object.keys(body);
        data.sort(function (a: any, b: any) { return b - a })
        data.forEach((element: any) => {
          var obj = {
            label: element + '-' + (element * 1 + 1),
            value: element
          }
          this.dateDropDown.push(obj);
        })
      })
    this.year = this.dateDropDown[0].value;
    setTimeout(() => {
      this.year = this.dateDropDown[0].value;
      this.getLeapPortfolioData();
      this.getLeapPortfolioDataSum();
    }, 500);
  }
  decryption(texttDycrypt: any) {
    let tokenFromUI = "8080808080808080";
    let _key = CryptoJS.enc.Utf8.parse(tokenFromUI);
    let _iv = CryptoJS.enc.Utf8.parse(tokenFromUI);
    var text2 = texttDycrypt;
    var decryptedValue = CryptoJS.AES.decrypt(text2, _key, {
      keySize: 256 / 8,
      iv: _iv,
      padding: CryptoJS.pad.Pkcs7,
      mode: CryptoJS.mode.CBC

    })
    var decryptedstring = decryptedValue.toString(CryptoJS.enc.Utf8);
    return decryptedstring;
  }
  getCurrentFinancialYear() {
    let fiscalyear = "";
    let today = new Date();
    if ((today.getMonth() + 1) <= 3) {
      fiscalyear = (today.getFullYear() - 1) + "-" + today.getFullYear()
    } else {
      fiscalyear = today.getFullYear() + "-" + (today.getFullYear() + 1)
    }
    return fiscalyear
  }
  getLeapPortfolioData() {
    this.data.segment = 'TS';
    this.data.Clid = this.uID;
    this.data.year = this.year
    this.data.type = "first";
    this._portfolioService.getLeapPortfolioData(this.data).subscribe((res: any) => {
      this.portfolioData = res;
      if (typeof this.portfolioData.data == 'object') {
        if (Object.keys(this.portfolioData.data).length <= 0) {
          this.proceedToSegment = false;
        } else {
          let dateUpdated = this.portfolioData.data;
          this.timeupdated = (new Date(dateUpdated));
          this.proceedToSegment = true;
        }
      }
      else {
        let dateUpdated = this.portfolioData.data;
        this.timeupdated = (new Date(dateUpdated));
        const currentDate = new Date();
        // console.log('last update', new Date(dateUpdated), new Date());
        const day1 = this.timeupdated.getDate();
        const month1 = this.timeupdated.getMonth();
        const year1 = this.timeupdated.getFullYear();

        const day2 = currentDate.getDate();
        const month2 = currentDate.getMonth();
        const year2 = currentDate.getFullYear();
        if (new Date().getDay() != 0 || new Date().getDay() != 6) {
          setInterval(() => {
            if (this.refetchDataCount <= 4) {
                if(this.refetchDataCount == 3 || this.refetchDataCount == 4) {
                  this.refetchDataDelay = this.refetchDataDelay*2;
                }
              if (year1 < year2 || (year1 === year2 && (month1 < month2 || (month1 === month2 && day1 < day2)))) {
                // this.data.segment = 'UPDATE';
                // this.data.Clid = this.uID;
                // this.data.year = this.year
                // this.data.type = "first";
                // this._portfolioService.getLeapPortfolioData(this.data).subscribe((res: any) => {
                  console.log('update api called',this.refetchDataCount);
                  this.getLeapPortfolioData();
                  this.getLeapPortfolioDataSum();
                // })
                this.refetchDataCount++;
              }
            }
          }, this.refetchDataDelay);
          this.proceedToSegment = true;
        }
      }
    });
  }
  getLeapPortfolioDataSum() {
    let data = {
      segment: "SUM",
      Clid: this.uID,
      year: this.year,
      type: "first"
    }
    this._portfolioService.getLeapPortfolioData(data).subscribe((res: any) => {
      let sumData = res;
      this.overviewDataLength = Object.keys(sumData.data).length;
      if (Object.keys(sumData.data).length > 0) {
        for (const keys in sumData.data) {
          if (keys == this.year) {
            this.overViewData1 = Object.values(sumData.data[keys]);
            for (let i = 0; i < this.overViewData1.length; i++) {
              if (this.overViewData1[i]['EX'] == 'EQ') {
                this.segementActiveEQ = true;
              }
              else if (this.overViewData1[i]['EX'] == 'DE') {
                this.segementActiveDE = true;
              }
              else if (this.overViewData1[i]['EX'] == 'CU') {
                this.segementActiveCU = true;
              }
              else if (this.overViewData1[i]['EX'] == 'CO') {
                this.segementActiveCO = true;
              }
              else if (this.overViewData1[i]['EX'] == 'MF') {
                this.segementActiveMF = true;
              }
              // else {
              //   this.segementActive = false
              // }

            }

          }
        }
      }
      else {
        this.proceedToSegment = false;
      }
    });
  }
  totalInvested(inv: { investement: any; }) {
    var inv = inv;
    this.totalInv = inv.investement;
  }
  selectedMarketType(value: any) {
    this.type = value;
  }
  selectedYear(value: any) {
    this.year = value;
  }
  encryption(text: any) {
    let tokenFromUI = "8080808080808080";
    // Generate a random 128-bit key and IV
    let _key = CryptoJS.enc.Utf8.parse(tokenFromUI);
    let _iv = CryptoJS.enc.Utf8.parse(tokenFromUI);
    // var encryptedstring = encryptedlogin.toString();
    // return encryptedstring;
    let encrypted = CryptoJS.AES.encrypt(
      CryptoJS.enc.Utf8.parse(text), _key, {
      keySize: 256 / 8,
      iv: _iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    // encrypted = encrypted.toString();
    return encrypted.toString();
  }
  changeMarket(value: any) {
    this.market = value;
    this.marketType = value;
    switch (this.market) {
      case 'OVERVIEW':
        this.sectionTitle = "PORTFOLIO"
        break;
      case 'EQ':
        this.sectionTitle = "EQUITY"
        break;
      case 'CO':
        this.sectionTitle = "COMMODITY"
        break;
      case 'CU':
        this.sectionTitle = "CURRENCY"
        break;
      case 'DE':
        this.sectionTitle = "DERIVATIVE"
        break;
      case 'MF':
        this.sectionTitle = "MUTUAL FUND"
        break;
    }
  }


  componentCallChecker = {
    selected_market: {
      event_status: false,
      tokens: []
    },
    equity_stock_table_change: {
      event_status: false,
      tokens: []
    }
  }

}