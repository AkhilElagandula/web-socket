import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {PortfolioDetailsComponent} from './portfolio-details/portfolio-details.component';
import {PortfolioDetailsSegmentComponent} from './portfolio-details-segment/portfolio-details-segment.component';
import {PortfolioOverviewComponent} from './portfolio-overview/portfolio-overview.component'
import { HomeComponent } from './home/home.component';
import { NotfoundComponent } from './notfound/notfound.component'
import { PortfolioDetailsComponentTest } from './portfolio-details copy/portfolio-details.component';
const routes: Routes = [
  {path:'', component: HomeComponent },
  {path:'portfolio', component:PortfolioDetailsComponent},
  {path:'portfoliotest', component:PortfolioDetailsComponentTest},
  { path: '**', component: NotfoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
