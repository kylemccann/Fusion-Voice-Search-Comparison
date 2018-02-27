import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RecordRTCComponent } from './record-rtc/record-rtc.component';

import { AppComponent } from './app.component';
import {HttpClientModule} from '@angular/common/http';



import { FormsModule, ReactiveFormsModule } from '@angular/forms';



@NgModule({
  declarations: [
    AppComponent,
    RecordRTCComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
