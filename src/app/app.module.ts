import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import {HttpClientModule} from '@angular/common/http';


// import {Recorder} from 'recorder-js';
// import {RecordRTC} from 'recordrtc';





import {FormsModule} from '@angular/forms';



@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule
    // Recorder,
    // RecordRTC
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
