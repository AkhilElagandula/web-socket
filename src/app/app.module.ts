import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import {PortfolioDetailsComponent} from './portfolio-details/portfolio-details.component';
import { PortfolioDetailsComponentTest } from './portfolio-details copy/portfolio-details.component';
import {PortfolioDetailsSegmentComponent} from './portfolio-details-segment/portfolio-details-segment.component';
import {PortfolioOverviewComponent} from './portfolio-overview/portfolio-overview.component'
import { PortfolioDetailsSegmentComponentTest } from './portfolio-details-segment copy/portfolio-details-segment.component';
import { PortfolioOverviewComponentTest } from './portfolio-overview copy/portfolio-overview.component';
import { FormsModule } from '@angular/forms';
import { HomeComponent } from './home/home.component';
import { NotfoundComponent } from './notfound/notfound.component';
import { MinusSignToParens } from './minuspipe';
@NgModule({
  declarations: [
    AppComponent,
    PortfolioDetailsComponent,
    PortfolioDetailsSegmentComponent,
    PortfolioOverviewComponent,
    HomeComponent,
    NotfoundComponent,
    PortfolioDetailsComponentTest,
    PortfolioDetailsSegmentComponentTest,
    PortfolioOverviewComponentTest,
    MinusSignToParens
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule
  ],
  exports:[
    PortfolioDetailsComponent,
    PortfolioDetailsSegmentComponent,
    PortfolioOverviewComponent
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
