import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// import { AngularFireModule } from 'angularfire2';
// import { AngularFireDatabase } from 'angularfire2/database';
declare var firebase: any;
@Injectable(
  {
    providedIn: 'root'
  }
)
export class PortfolioService {
  public app: any;
  leapPortfolioUrl = 'https://www.religareonline.com:4000/portfolio/getPortfolioData'
  constructor(public httpClient: HttpClient) {
    var config = {
      apiKey: "AIzaSyDpm_S1TD4PW43jINBHwH66Lm1z-JTZscg",
      authDomain: "portfolio-9bbba.firebaseapp.com",
      databaseURL: "https://portfolio-9bbba.firebaseio.com",
      projectId: "portfolio-9bbba",
      storageBucket: "portfolio-9bbba.appspot.com",
      messagingSenderId: "652770845641"
    };
    this.app = firebase.initializeApp(config, "portflio");
  }

  getLeapPortfolioData(request: any): any {
    let headers = new Headers({ 'Content-Type': 'application/json' });
    return this.httpClient.post(this.leapPortfolioUrl, request);
  }
  getYears(request: any): any {
    let headers = new Headers({ 'Content-Type': 'application/json' }); // ... Set content type to JSON
    // let options = new RequestOptions({ headers: headers }); // Create a request option
    return this.httpClient.get('https://portfolio-9bbba.firebaseio.com/CG-PORTFOLIO/USER/' + request + '/SUM.json?shallow=true');
  }
}



