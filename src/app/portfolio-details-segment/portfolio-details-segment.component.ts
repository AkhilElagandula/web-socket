import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { PortfolioService } from '../portfolio.service';
import { OdinwebsocketService } from '../odinwebsocket.service';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-portfolio-details-segment',
  templateUrl: './portfolio-details-segment.component.html',
  styleUrls: ['./portfolio-details-segment.component.css']
})
export class PortfolioDetailsSegmentComponent implements OnInit {

  constructor(public _portfolioService: PortfolioService, public odinWebSocketService: OdinwebsocketService) {

  }
  private socketSubscription!: Subscription;
  private connectionErrorSubscription!: Subscription;
  // @Input() type; 
  @Input() uID: any;
  @Input() dateDropDown!: any;
  @Input() market!: any;
  @Input() totalInv!: any;
  @Output() socketCall: EventEmitter<any> = new EventEmitter()
  public EquityData: any;
  activeTab = "GainLoss";
  public data = {
    segment: "",
    Clid: "",
    year: "",
    type: "first"
  };
  msg = "";
  equityAPIData = false;
  public showPostiton = false;
  public selectedscript: any;
  outsideClickActive: any = false;
  public index: any;
  scriptdata: any = [];
  public segmentData: any = [];
  public segmentTRData = [];
  totalUnrealisedGLAbsolutChange = 0.0;
  totalUnrealisedGLPercentageChange = 0.0;
  todayUnrealisedTGLAbsolutChange = 0.0
  todayUnrealisedTGLPercentageChange = 0.0;
  totalUnrealisedMGLAbsolutChange = 0;
  totalUnrealisedMGLPercentageChange = 0
  todayUnrealisedMTGLAbsolutChange = 0.0;
  todayUnrealisedMTGLPercentageChange = 0.0;
  totalRealisedGL = 0.0;
  totalRealisedGLPercent = 0.0;
  CMV: any;
  type: any;
  tokensToSubscribe: any;
  uniqueArray: any;
  scriplist: any = {};
  tempkeys: any;
  PC = 0;
  public equityData = {
    RG: 0,
    RGP: 0,
    overAllGL: 0,
    overAllGLPercentage: 0,
    todayAllGL: 0,
    todayAllGLP: 0,
    cmv: 0,
    totalAmountInv: 0,
    TC: 0,
  };
  totalAmountInvested = 0
  showMsg: any
  marketStatus2 = [
    { label: "Open", value: "P" },
    { label: "Closed", value: "Z" },
  ];
  gainlossTab = 'GainLoss';
  socketCallIdentifier = false;
  selectedYear: any;
  marketValue = 0;
  ngOnInit() {
    this.type = 'P';
    this.market = this.market;
    setTimeout(() => {
      this.selectedYear = this.dateDropDown[0].value;
      this.getLeapPortfolioData(this.gainlossTab);
    })


  }
  getLeapPortfolioData(gainlossTab: string) {
    if (this.type == 'P') {
      this.selectedYear = this.dateDropDown[0].value;
    }
    this.data = {
      segment: this.market,
      Clid: this.uID,
      year: this.selectedYear,
      type: 'first'
    }
    this._portfolioService.getLeapPortfolioData(this.data).subscribe((res: any) => {
      this.equityAPIData = true;
      this.EquityData = res;
      if (Object.keys(this.EquityData.data).length > 0) {
        if (this.EquityData.data["SCRIP-LIST"] != null) {
          for (const keys in this.EquityData.data["SCRIP-LIST"]) {
            this.scriplist = this.EquityData.data["SCRIP-LIST"];
            const entries: any = Object.entries(this.scriplist);
            if (this.type == 'P') {
              const filteredEntries = entries.filter(([key, value]: any) => value['TY'] === "P");
              // Convert the filtered array back to an object
              this.scriplist = filteredEntries.reduce(this.withObjectAssign, {});
              this.tempkeys = Object.keys(this.scriplist);
            } else {
              this.tempkeys = Object.keys(this.scriplist);
            }
          }
          // console.log(this.tempkeys);
          this.callWebSocket(this.tempkeys);
          // console.log(this.scriplist);
          this.segmentData = Object.values(this.scriplist);
          this.totalUnrealisedGLAbsolutChange = 0;
          this.totalUnrealisedGLPercentageChange = 0;
          this.totalUnrealisedMGLAbsolutChange = 0
          this.totalUnrealisedMGLPercentageChange = 0
          let MV = 0;
          var marketValue = 0.0
          var investmentValue = 0.0
          if (this.segmentData.length > 0) {
            this.totalRealisedGL = 0.0;
            this.totalRealisedGLPercent = 0.0;
            for (let i = 0; i < this.segmentData.length; i++) {
              if (this.segmentData[i].TY == 'P' && gainlossTab == "GainLoss") {
                this.segmentData[i].CMV = this.segmentData[i].QTY * this.segmentData[i].LTP;
                this.segmentData[i].TCMV = (this.segmentData[i].QTY * (this.segmentData[i].CV));

                // TINV += this.segmentData[i].INV
                investmentValue += this.segmentData[i].INV;
                MV += this.segmentData[i].CMV
                if (parseInt(this.segmentData[i].QTY) > 0) {
                  marketValue += this.segmentData[i].CMV;
                  this.segmentData[i]['UnrealisedGLAbsoluteChange'] += (this.segmentData[i].CMV - this.segmentData[i].INV);
                  this.totalUnrealisedGLPercentageChange = ((marketValue - investmentValue) / investmentValue) * 100;
                }
                else {
                  marketValue += this.segmentData[i].CMV;
                  this.segmentData[i].UnrealisedGLAbsoluteChange = this.segmentData[i].CMV + this.segmentData[i].LTP;
                  this.totalUnrealisedGLPercentageChange = ((marketValue + investmentValue) / investmentValue) * 100;
                }
                if (this.market == 'MF') {
                  this.segmentData[i].CMV = this.segmentData[i].QTY * this.segmentData[i].LTP;
                  this.segmentData[i].TCMV = (this.segmentData[i].QTY * (this.segmentData[i].CV));
                  investmentValue += this.segmentData[i].INV;
                  MV += this.segmentData[i].CMV
                  this.segmentData[i].UnrealisedMGLAbsoluteChange = (this.segmentData[i].CMV - this.segmentData[i].INV);
                  this.totalUnrealisedGLPercentageChange = ((marketValue - investmentValue) / investmentValue) * 100;
                  this.totalUnrealisedMGLAbsolutChange += this.segmentData[i].UnrealisedMGLAbsoluteChange;
                  this.totalUnrealisedMGLPercentageChange = ((MV - investmentValue) / investmentValue) * 100;
                  this.todayUnrealisedTGLAbsolutChange += this.segmentData[i].TCMV || 0.0;
                  this.todayUnrealisedTGLPercentageChange += this.segmentData[i].CP || 0.0;
                }
              }
              else if (this.segmentData[i].TY == 'Z' && this.market != 'EQ') {
                this.PC += this.segmentData[i].PC
                this.totalRealisedGL += this.segmentData[i].RV;

                // this.totalRealisedGLPercent += this.segmentData[i].RP;
              }
              if ((this.segmentData[i].TY == 'Z' || this.segmentData[i].TY == 'P') && this.segmentData[i].TY_C == '1' && this.market == 'EQ') {
                this.PC += this.segmentData[i].PC
                this.totalRealisedGL += this.segmentData[i].RV;
                // this.totalRealisedGLPercent += this.segmentData[i].RP;
              }
              // if (this.market == 'MF') {
              //   this.totalUnrealisedGLAbsolutChange += this.segmentData[i].UnrealisedGLAbsoluteChange;
              //   this.totalUnrealisedGLPercentageChange += this.segmentData[i].UnrealisedGLPercentageChange
              //   this.todayUnrealisedTGLAbsolutChange += this.segmentData[i].TCMV || 0.0;
              //   this.todayUnrealisedTGLPercentageChange += this.segmentData[i].CP || 0.0;
              // }
            }
          } else {
            this.segmentData = [];
            this.msg = "No Data Found";
          }
        } else {
          this.msg = "No Data Found";
        }

      } else {
        this.msg = "No Data Found";
      }
    });

  }
  withObjectAssign(object: any, [key, value]: any) {
    return Object.assign(object, { [key]: value })
  }
  ngOnDestroy() {
    this.socketSubscription.unsubscribe();
    this.odinWebSocketService.UnSubscribeFeed('206', this.tempkeys);
    this.connectionErrorSubscription.unsubscribe();
    this.showMsg = false;
  }
  // componentCallChecker = {
  //   equity_stock_table_change: {
  //     event_status: false,
  //     tokens: []
  //   }
  // }
  callWebSocket(ev: any) {
    // var that = this;
    this.odinWebSocketService.webSocketConnect('206', ev);
    this.socketSubscription = this.odinWebSocketService.socketData$.subscribe(
      (responseLTP: any) => {
        // Handle incoming WebSocket data
        // console.log('Received WebSocket data:', responseLTP);
        if (this.scriplist) {
          let tempKeys = Object.keys(this.scriplist);
          var index1 = tempKeys.indexOf(responseLTP.KEY);
          if (index1 === -1) {
            console.log('not found')
          }
          else {

            if (responseLTP.KEY.split('-')[0] !== "0") {
              this.scriplist[responseLTP.KEY].LTT = responseLTP.LTT || 0;
              this.scriplist[responseLTP.KEY].LTP = responseLTP.LTP / responseLTP.DL || 0;
              this.scriplist[responseLTP.KEY].PC = responseLTP.PC / responseLTP.DL || 0;
              let pC = this.scriplist[responseLTP.KEY].PC;
              this.scriplist[responseLTP.KEY].CV = this.scriplist[responseLTP.KEY].LTP - this.scriplist[responseLTP.KEY].PC || 0;
              this.scriplist[responseLTP.KEY].CP = (pC != 0 && pC && pC != null) ? (this.scriplist[responseLTP.KEY].CV / this.scriplist[responseLTP.KEY].PC) * 100 : 0;
              this.scriplist[responseLTP.KEY].DEE = responseLTP.DE || 0;

            }
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
        // Handle WebSocket connection error
        console.error('WebSocket connection error:', error);
        // Implement your error handling logic here
      }
    );
  }
  // Method to open scrip details on click
  OpenDetails(scripName: any, index: any) {
    if (this.index !== index + 1) {
      this.outsideClickActive = false;
      this.index = index + 1;
      this.scriptdata = [];
      if (this.selectedscript == undefined) {
        this.selectedscript = scripName;
        this.showPostiton = (!this.showPostiton);
      }
      else if (scripName != this.selectedscript && this.showPostiton == true) {
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
        if (this.segmentData[i]["SY"] == this.selectedscript) {
          this.scriptdata.push(this.segmentData[i]);
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
  selectedMarketType(e: any) {
    this.type = e;
    this.segmentData = [];
    this.equityAPIData = false;
    this.scriplist = {};
    this.socketCallIdentifier = false;
    this.getLeapPortfolioData(this.gainlossTab);
  }
  selectedyear() {
    // console.log(e)
    // this.selectedYear = e; 
    this.equityAPIData = false;
    this.segmentData = [];
    this.scriplist = {};
    this.socketCallIdentifier = false;
    this.getLeapPortfolioData(this.gainlossTab);
  }
  showTab(tabName: any) {
    this.gainlossTab = tabName;
  }

}
