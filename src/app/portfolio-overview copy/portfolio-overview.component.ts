import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { PortfolioService } from '../portfolio.service';
import { Subscription } from 'rxjs';
import { OdinwebsocketserviceService } from '../odinwebsocketservice.service';
@Component({
  selector: 'app-portfolio-overview-test',
  templateUrl: './portfolio-overview.component.html',
  styleUrls: ['./portfolio-overview.component.css']
})
export class PortfolioOverviewComponentTest implements OnInit {
  constructor(private _portfolioService: PortfolioService, public odinWebSocketService: OdinwebsocketserviceService) { }
  // @Input() type; 
  private socketSubscription!: Subscription;
  private connectionErrorSubscription!: Subscription;
  @Input() uID: any;
  @Input()
  dateDropDown!: { value: any; }[];
  @Input() market: any;
  @Output() totalInvested: EventEmitter<any> = new EventEmitter<any>();
  overViewAPIData: any = false;
  public overViewData: any;
  public portfolioData: any;
  public totalMarketValue: any = 0;
  public totalGL: any = 0;
  public totalInv: any = 0;
  public totalGLP: any = 0;
  public EQPercentage: any = 0;
  public COPercentage: any = 0;
  public CUPercentage: any = 0;
  public MFPercentage: any = 0;
  public DEPercentage: any = 0;
  selectedYear: any;
  public EquityData: any;
  public showPostiton = false;
  public selectedscript: any;
  outsideClickActive: any = false;
  public index: any;
  gainerCount: any = 0;
  loserCount: any = 0;
  scriptdata: any = [];
  public segmentData: any = [];
  public segmentTRData: any = [];
  public gainerLoserData: any = [];
  public innerRes: any;
  public overviewDataSegment: any = [];
  public calculateCmv: any = 0;
  UnrealisedGLAbsolutChange: any = 0.0;
  UnrealisedGLPercentageChange: any = 0.0;
  UnrealisedTGLAbsolutChange: any = 0.0
  UnrealisedTGLPercentageChange: any = 0.0;
  totalUnrealisedGLAbsolutChange: any = 0.0;
  totalGainerGLPercent: any = 0;
  totalGainerGL: any = 0
  totalLoserGLPercent: any = 0
  totalLoserGL: any = 0;
  mktValue: any = 0;
  CMV: any = 0;
  totalUnrealisedGLPercentageChange: any = 0.0;
  todayUnrealisedTGLAbsolutChange: any = 0.0
  todayUnrealisedTGLPercentageChange: any = 0.0;
  totalAmountInvested: any = 0;
  marketValue: any = 0;
  overviewDataLength: any
  gainerloserDataLength: any;
  totalScriplength: any;
  msg: any = ""
  socketCallIdentifier: any = false;
  scriplist: any = {};
  tempkeys: any = [];
  tokensToSubscribe: any = [];
  uniqueArray: any = [];
  activeTab: any = "Gainer";
  type: any;
  segmentData1: any = [];
  overallReturn: any = 0;
  overallReturnpercentage: any = 0;
  intermediateMF: any = [];
  ngOnInit() {
    this.selectedYear = this.dateDropDown[0].value;
    this.socketCallIdentifier = false;
    setTimeout(() => {
      this.getLeapPortfolioData();
      this.getLeapPortfolioEQData()
    });
  }
  getLeapPortfolioData() {
    let data = {
      segment: "SUM",//this.type,
      Clid: this.uID,
      year: this.selectedYear,
      type: 'first'
    }
    this._portfolioService.getLeapPortfolioData(data).subscribe((res: any) => {
      this.overViewAPIData = true;
      this.portfolioData = res;
      this.overviewDataLength = Object.keys(this.portfolioData.data).length;
      if (Object.keys(this.portfolioData.data).length > 0) {
        for (const keys in this.portfolioData.data) {
          if (keys == this.selectedYear) {
            this.overViewData = Object.values(this.portfolioData.data[keys]);
            let sortEX = ['EQ', 'DE', 'CU', 'CO', 'MF'];
            for (let i = 0; i < this.overViewData.length; i++) {
              this.overViewData.sort(function (a: { EX: string; }, b: { EX: string; }) {
                return sortEX.indexOf(a.EX) - sortEX.indexOf(b.EX);
              });
              // console.log(this.overViewData)
              if (this.overViewData[i]['EX'] == 'EQ') {
                this.EQPercentage = this.overViewData[i]['AP'];
              }
              if (this.overViewData[i]['EX'] == 'CO') {
                this.COPercentage = this.overViewData[i]['AP'];
              }
              if (this.overViewData[i]['EX'] == 'CU') {
                this.CUPercentage = this.overViewData[i]['AP'];
              }
              if (this.overViewData[i]['EX'] == 'MF') {
                this.MFPercentage = this.overViewData[i]['AP'];
              }
              if (this.overViewData[i]['EX'] == 'DE') {
                this.DEPercentage = this.overViewData[i]['AP'];
              }
            }
          }
        }
        for (let i = 0; i < this.overViewData.length; i++) {
          this.calculateCmv = 0;
          setTimeout(() => {
            this.totalInv += this.overViewData[i]['AI'];
            this.totalInvested.emit({ investement: this.totalInv });
            switch (this.overViewData[i]['EX']) {
              case 'CO':
                this.overViewData[i]['EXFN'] = 'Comodity'
                break;
              case 'CU':
                this.overViewData[i]['EXFN'] = 'Currency'
                break;
              case 'MF':
                this.overViewData[i]['EXFN'] = 'Mutual Funds'
                break
              case 'EQ':
                this.overViewData[i]['EXFN'] = 'Equity'
                break;
              case 'DE':
                this.overViewData[i]['EXFN'] = 'Derivative'
            }
          }, 1000);
        }
      } else {
        this.msg = " No Data Found";
      }
    });
  }

  getLeapPortfolioEQData() {
    this.socketCallIdentifier = false;
    let data = {
      segment: "OVERVIEW",//this.type,
      Clid: this.uID,
      year: this.selectedYear,
      type: 'first'
    }
    this.segmentData = [];
    this._portfolioService.getLeapPortfolioData(data).subscribe((res: any) => {
      this.EquityData = res;
      if (Object.keys(this.EquityData.data).length > 0) {
        for (const keys in this.EquityData.data["SCRIP-LIST"]) {
          this.scriplist = this.EquityData.data["SCRIP-LIST"];
          this.totalScriplength = this.EquityData.data["CNT"];
          this.tempkeys = Object.keys(this.scriplist);
          // console.log(this.tempkeys);
          // if (!this.socketCallIdentifier) {
          //   var tokenWithComponentName = { name: 'selected_market', tokens: this.tempkeys }
          //   // console.log(tokenWithComponentName);
          //   this.socketCallIdentifier = true;
          // }
        }
        this.callWebSocket(this.tempkeys)
        this.segmentData = Object.values(this.scriplist);
        setTimeout(() => {
          var keyKeys = Object.keys(this.scriplist);
          for (let keys in this.scriplist) {
            var k = keys.split('-');
            // console.log(k);
            if (k.length > 1) {
              switch (+k[0] * 1) {
                //equity
                case 1:
                case 3:
                  var startingWith1 = keyKeys.filter(function (element) {
                    return element.startsWith('1-');
                  });
                  var startingWith3 = keyKeys.filter(function (element) {
                    return element.startsWith('3-');
                  });
                  let intermediateEQ = [];
                  var ex = 'EQ';
                  intermediateEQ.push(...startingWith1);
                  intermediateEQ.push(...startingWith3);
                  this.calculateOverviewData(intermediateEQ, ex, this.scriplist)
                  break;
                case 2:
                case 4:
                  var startingWith4 = keyKeys.filter(function (element) {
                    return element.startsWith('4-');
                  });
                  var startingWith2 = keyKeys.filter(function (element) {
                    return element.startsWith('2-');
                  });
                  var ex = 'DE';
                  let intermediateDE = [];
                  intermediateDE.push(...startingWith2);
                  intermediateDE.push(...startingWith4);
                  this.calculateOverviewData(intermediateDE, ex, this.scriplist)
                  break;
                case 5:
                case 7:
                  var startingWith5: any = keyKeys.filter(function (element) {
                    return element.startsWith('5-');
                  });
                  var startingWith7: any = keyKeys.filter(function (element) {
                    return element.startsWith('7-');
                  });
                  var ex = 'CO';
                  let intermediateCO: any = [];
                  intermediateCO.push(...startingWith5);
                  intermediateCO.push(...startingWith7);
                  this.calculateOverviewData(intermediateCO, ex, this.scriplist)
                  break;
                case 11:
                case 13:
                  var startingWith11: any = keyKeys.filter(function (element) {
                    return element.startsWith('11-');
                  });
                  var startingWith13: any = keyKeys.filter(function (element) {
                    return element.startsWith('13-');
                  });
                  var ex = 'CU';
                  let intermediateCU: any = [];
                  intermediateCU.push(...startingWith11);
                  intermediateCU.push(...startingWith13);
                  this.calculateOverviewData(intermediateCU, ex, this.scriplist)
                  break;
              }
            }
            else {
              var intermediateMF: any = [];
              // console.log(keys);
              var ex = 'MF';
              this.intermediateMF.push(keys);
              this.calculateOverviewData(this.intermediateMF, ex, this.scriplist)
            }
          }
        }, 1000)


        for (let i = 0; i < this.segmentData.length; i++) {
          this.segmentData[i].CMV = this.segmentData[i].QTY * this.segmentData[i].LTP;
          if (this.segmentData[i].QTY >= 0) {
            this.segmentData[i].UnrealisedGLAbsoluteChange = this.segmentData[i].CMV - this.segmentData[i].INV;
          }
          if (this.segmentData[i].QTY < 0) {
            this.segmentData[i].UnrealisedGLAbsoluteChange = this.segmentData[i].CMV + this.segmentData[i].INV;
          }
          this.segmentData[i].UnrealisedGLPercentageChange = (this.segmentData[i].UnrealisedGLAbsoluteChange / this.segmentData[i].INV) * 100;
          this.segmentData[i].UnrealisedTGLAbsoluteChange = this.segmentData[i].CMV - this.segmentData[i].INV;
          this.segmentData[i].UnrealisedTGLPercentageChange = (this.segmentData[i].UnrealisedTGLAbsoluteChange / this.segmentData[i].INV) * 100;
          this.totalLoserGLPercent = 0;
          this.totalLoserGL = 0;
          this.totalGainerGL = 0;
          this.totalGainerGLPercent = 0;
          this.gainerCount = 0;
          this.loserCount = 0;
        }
        // Filter Gainer list
        if (this.activeTab == 'Gainer') {
          this.segmentData = this.segmentData.filter
            ((GL: { UnrealisedGLAbsoluteChange: number; }) => GL.UnrealisedGLAbsoluteChange > 0
            );
        }
        //  Filter Looser list
        else if (this.activeTab == 'Loser') {
          this.segmentData = this.segmentData.filter(
            (value: { UnrealisedGLAbsoluteChange: number; }) => value.UnrealisedGLAbsoluteChange <= 0
          );
        }
        else {
        }
        this.gainerloserDataLength = this.segmentData.length;
        if (this.gainerloserDataLength > 0) {
          this.msg = "";
        } else {
          this.msg = "No Data Found";
        }
      } else {
        this.msg = " No Data Found";
      }
    });
  }
  // Calculate gain Loss
  calculateOverviewData(keylist: string | string[], ex: string, scriplist: { [s: string]: unknown; } | ArrayLike<unknown>) {
    this.overviewDataSegment = Object.values(scriplist);
    // console.log(scriplist);  
    this.marketValue = 0;
    var TGL: any = 0;
    for (let key in scriplist) {
      if (keylist.includes(key)) {
        this.marketValue += this.scriplist[key].QTY * this.scriplist[key].LTP;
        TGL += this.scriplist[key].CV * this.scriplist[key].QTY;
        for (let i = 0; i < this.overViewData.length; i++) {
          this.totalInv += this.overViewData[i]['AI'];
          if (this.scriplist[key].QTY >= 0) {
            this.totalGL = this.marketValue - this.overViewData[i]['AI'];
            this.totalGLP = (this.marketValue - this.overViewData[i]['AI']) * 100 / this.overViewData[i]['AI'];
          }
          else {
            this.totalGL = this.marketValue + this.overViewData[i]['AI'];
            this.totalGLP = (this.marketValue + this.overViewData[i]['AI']) * 100 / this.overViewData[i]['AI'];
          }
          if (this.overViewData[i]['EX'] == ex) {
            // this.overviewData[i]['CMV'] = scriplist[key].QTY;
            this.overViewData[i]['MV'] = this.marketValue ? this.marketValue : 0.0;
            this.overViewData[i]['GL'] = this.totalGL ? this.totalGL : 0.0;
            this.overViewData[i]['GLP'] = this.totalGLP ? this.totalGLP : 0.0;
            this.overViewData[i]['TGL'] = TGL ? TGL : 0.0;
          }
        }

      }
    }
  }
  //  Gainer looser value caculation
  GainLooseValue() {
    this.totalGainerGL = 0;
    this.totalLoserGL = 0;
    let TotalGINV = 0;
    let TotalLINV = 0;
    let lossMV = 0
    let gainMV = 0
    this.loserCount = 0;
    this.gainerCount = 0;
    this.overallReturn = 0;
    this.overallReturnpercentage = 0;
    for (const key in this.scriplist) {
      this.scriplist[key]['CMV'] = this.scriplist[key]['QTY'] * this.scriplist[key]['LTP'];
      if (this.scriplist[key]['QTY'] > 0) {
        this.scriplist[key]['UnrealisedGLAbsoluteChange'] = this.scriplist[key]['CMV'] - this.scriplist[key]['INV']
      }
      if (this.scriplist[key]['QTY'] < 0) {
        this.scriplist[key]['UnrealisedGLAbsoluteChange'] = this.scriplist[key]['CMV'] + this.scriplist[key]['INV']
      }
      if (this.scriplist[key]['UnrealisedGLAbsoluteChange'] < 0) {
        this.loserCount = this.loserCount + 1;
        lossMV += this.scriplist[key]['CMV'];
        this.totalLoserGL += this.scriplist[key]['UnrealisedGLAbsoluteChange']
        TotalLINV = TotalLINV + this.scriplist[key]['INV'];
        this.totalLoserGLPercent = ((lossMV - TotalLINV) / TotalLINV) * 100;
      }
      if (this.scriplist[key]['UnrealisedGLAbsoluteChange'] >= 0) {
        this.gainerCount = this.gainerCount + 1
        gainMV += this.scriplist[key]['CMV'];
        TotalGINV = TotalGINV + this.scriplist[key]['INV'];
        this.totalGainerGL += this.scriplist[key]['UnrealisedGLAbsoluteChange'];
        this.totalGainerGLPercent = ((gainMV - TotalGINV) / TotalGINV) * 100;
      }
      else { }
    }
    this.overallReturn = this.totalGainerGL + this.totalLoserGL;
    return null;
  }
  // Total Market Value Calculation
  getTMarketValue() {
    this.totalAmountInvested = 0;
    this.overallReturn = 0;
    this.overallReturnpercentage = 0;
    var totalAI = 0
    var TMV = 0;
    for (const key in this.scriplist) {
      // Market value
      this.totalAmountInvested += this.scriplist[key]['QTY'] * this.scriplist[key]['LTP'];
    }
    for (let i = 0; i < this.overViewData.length; i++) {
      totalAI += this.overViewData[i]['AI'];
      TMV += this.overViewData[i]['MV'];
    }
    this.GainLooseValue();
    return this.totalAmountInvested;
  }
  // Method to open scrip details on click
  OpenDetails(scripName: any, index: number) {

    if (this.index !== index + 1) {
      this.outsideClickActive = false;
      this.index = index + 1;
      this.scriptdata = [];
      if (this.selectedscript == undefined) {
        this.selectedscript = scripName;
        this.showPostiton = (!this.showPostiton);
      }
      else if (scripName != this.selectedscript && this.showPostiton == true) {
        // this.show =(!this.show) ;
        this.selectedscript = scripName;
      }
      else if (scripName != this.selectedscript && this.showPostiton == false) {
        this.selectedscript = scripName;
        this.showPostiton = (!this.showPostiton);
      }
      else {
        this.selectedscript = scripName;
        this.showPostiton = (!this.showPostiton);
      }
      var count = 0;
      for (var i = 0; i < this.segmentData.length; i++) {
        if (this.segmentData[i]['EX'] == 'EQ' || this.segmentData[i]['EX'] == 'MF') {
          if (this.segmentData[i]["SY"] == this.selectedscript) {
            this.scriptdata.push(this.segmentData[i]);
          }
        } else if (this.segmentData[i]['EX'] == 'DE' || this.segmentData[i]['EX'] == 'CU' || this.segmentData[i]['EX'] == 'CO') {
          if (this.segmentData[i]["DE"] == this.selectedscript) {
            this.scriptdata.push(this.segmentData[i]);
          }
        }
        count++
      }
      if (count == this.segmentData.length) {
        setTimeout(() => {
          this.outsideClickActive = !this.outsideClickActive;
        }, 1000);
      }
    }
  }
  ngOnDestroy() {
    this.socketSubscription.unsubscribe();
    this.odinWebSocketService.UnSubscribeFeed('206', this.tempkeys);
    this.connectionErrorSubscription.unsubscribe();
    // this.showMsg = false;
  }
  componentCallChecker = {
    selected_market: {
      event_status: false,
      tokens: []
    }
  }
  isNumber(val: any): boolean { return typeof val === 'number'; }
  callWebSocket(ev: any) {
    var that = this;
    this.odinWebSocketService.webSocketConnect('206', ev);
    this.socketSubscription = this.odinWebSocketService.socketData$.subscribe(
      (responseLTP: { KEY: string; LTT: number; LTP: number; DL: number; PC: number; DE: number; }) => {
        // Handle incoming WebSocket data
        // console.log('Received WebSocket data:', responseLTP);
        if (this.scriplist) {
          let tempKeys = Object.keys(this.scriplist);
          var index1 = tempKeys.indexOf(responseLTP.KEY);
          if (index1 === -1) {
            console.log('not found')
          }
          else {

            // if (responseLTP.KEY.split('-')[0] !== "0") {
            this.scriplist[responseLTP.KEY].LTT = responseLTP.LTT || 0;
            this.scriplist[responseLTP.KEY].LTP = responseLTP.LTP / responseLTP.DL || 0;
            this.scriplist[responseLTP.KEY].PC = responseLTP.PC / responseLTP.DL || 0;
            this.scriplist[responseLTP.KEY].CV = this.scriplist[responseLTP.KEY].LTP - this.scriplist[responseLTP.KEY].PC || 0;
            this.scriplist[responseLTP.KEY].CP = (this.scriplist[responseLTP.KEY].CV / this.scriplist[responseLTP.KEY].LTP) * 100 || 0.0;
            this.scriplist[responseLTP.KEY].DE = responseLTP.DE || 0;

            // }
            this.todayUnrealisedTGLAbsolutChange = 0;
            this.todayUnrealisedTGLPercentageChange = 0;
            this.totalUnrealisedGLAbsolutChange = 0;
            // this.totalUnrealisedGLPercentageChange = 0;
            this.marketValue = 0;
            // console.log(this.scriplist);
            Object.keys(this.scriplist).forEach(key => {
              if (this.scriplist[key].TY == 'P') {
                if (this.scriplist[key].CV) {
                  this.marketValue += this.scriplist[key].QTY * this.scriplist[key].LTP;
                  this.todayUnrealisedTGLAbsolutChange += (this.scriplist[key].QTY * this.scriplist[key].CV);
                } else {
                  this.todayUnrealisedTGLAbsolutChange += 0;
                }
                if ((this.marketValue - this.todayUnrealisedTGLAbsolutChange) === 0) {
                  this.todayUnrealisedTGLPercentageChange = 0;
                }
                else {
                  this.todayUnrealisedTGLPercentageChange = this.todayUnrealisedTGLAbsolutChange * 100 / (this.marketValue - this.todayUnrealisedTGLAbsolutChange);
                }
                if (this.scriplist[key].QTY > 0) {
                  this.totalUnrealisedGLAbsolutChange += (this.scriplist[key].QTY * this.scriplist[key].LTP) - this.scriplist[key].INV;
                }
                else if (this.scriplist[key].QTY < 0) {
                  this.totalUnrealisedGLAbsolutChange += (this.scriplist[key].QTY * this.scriplist[key].LTP) + this.scriplist[key].INV;
                }
                this.totalAmountInvested = this.totalInv
                // console.log(this.marketValue, this.totalAmountInvested)
                // if (this.marketValue == 0 || this.totalAmountInvested == 0) {
                //   this.totalUnrealisedGLPercentageChange = 0;
                // } else {
                //   if (this.marketValue > 0) {
                //     this.totalUnrealisedGLPercentageChange = (this.marketValue - this.totalAmountInvested) * 100 / (this.totalAmountInvested);

                //   }
                //   else {
                //     this.totalUnrealisedGLPercentageChange = (this.marketValue + this.totalAmountInvested) * 100 / (this.totalAmountInvested);
                //   }

                // }
              }

            })


          }
        }
        else {
          // responseLTP.ref.off();
        }
      },
      (error: any) => {
        // Handle WebSocket data error
        console.error('WebSocket data error:', error);
      }
    );
    this.connectionErrorSubscription = this.odinWebSocketService.connectionError$.subscribe(
      (error: any) => {
        console.error('WebSocket connection error:', error);
      }
    );
  }
  calculateTodayAllGLMF(data: { CV: number; QTY: number; cmv: number; todayAllGL: number; }) {
    let todayAllGL = 0;
    let todayAllGLP = 0;
    let cv = data.CV ? data.CV : 10;
    todayAllGL = data.QTY * data.CV;
    if (data.cmv - data.todayAllGL == 0) {
      todayAllGLP = 0;
    } else {
      todayAllGLP = (todayAllGL) * 100 / (data.cmv - todayAllGL);
    }
    return [todayAllGL, todayAllGLP];
  }
  showTab(name: any) {
    this.activeTab = name;
  }
  checkForNumber(n: number) {
    if ((Number(n) === n && n % 1 === 0) || Number(n) === n && n % 1 !== 0) {
      return true;
    }
    return false;
  }

}
