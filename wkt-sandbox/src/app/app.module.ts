import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { WktComponent } from './wkt/wkt.component';

import { WktService } from './services/wkt.service';
import { ClliComponent } from './clli/clli.component';

@NgModule({
  declarations: [
    AppComponent,
    WktComponent,
    ClliComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule
  ],
  providers: [
    WktService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
