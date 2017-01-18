import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule, Routes } from '@angular/router';
import { Ng2BootstrapModule } from 'ng2-bootstrap';

import { PicSimEmscriptenService } from './pic-sim/services/pic-sim-emscripten.service';
import { GistService } from './pic-sim/services/gist.service';


import { AppComponent } from './app.component';
import { PicSimComponent } from './pic-sim/pic-sim.component';
import { Board1Component } from './pic-sim/boards/board1/board1.component';
import { GistComponent } from './pic-sim/gist/gist.component';
import { Board2Component } from './pic-sim/boards/board2/board2.component';


const routes: Routes = [
  { path: 'board/1', component: Board1Component },
  { path: 'board/2', component: Board2Component },
  { path: '', redirectTo: 'board/1', pathMatch: 'full' },
  { path: ':id', component: GistComponent },
];


@NgModule({
  declarations: [
    AppComponent,
    PicSimComponent,
    Board1Component,
    GistComponent,
    Board2Component
  ],
  imports: [
    Ng2BootstrapModule.forRoot(),
    BrowserModule,
    FormsModule,
    HttpModule,
    RouterModule.forRoot(routes)
  ],
  providers: [PicSimEmscriptenService, GistService],
  bootstrap: [AppComponent]
})
export class AppModule { }
