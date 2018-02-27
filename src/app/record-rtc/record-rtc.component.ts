import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';


@Component({
  selector: 'record-rtc',
  templateUrl: './record-rtc.component.html',
  styleUrls: ['./record-rtc.component.scss']
})
export class RecordRTCComponent implements AfterViewInit{

  private stream: MediaStream;
  private recordRTC: any;

  @ViewChild('video') video;

  constructor() {
    // Do stuff
  }

  ngAfterViewInit() {
    // set the initial state of the video
    let video:HTMLVideoElement = this.video.nativeElement;
    video.muted = false;
    video.controls = true;
    video.autoplay = false;
  }


}
