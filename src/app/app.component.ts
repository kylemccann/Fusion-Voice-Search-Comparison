import {Component, OnInit, ViewChild, AfterViewInit, ElementRef} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import * as RecordRTC from '../assets/recordrtc';
// import StereoAudioRecorder = require('recordrtc/dev/StereoAudioRecorder.js');
// import Recorder = require('recorder-js');

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})


export class AppComponent {
  title = 'Fusion Google Voice Search Demo';
  d: any;
  resp: any;
  googleResponse: any;
  noResults: string;
  recordStatus: boolean;
  recordRTC: any;
  app = this;
  stream: any;
  recordedBlob: any;
  public search: string;
  numberOfResults: number;
  public searchHistory = [];


  // Style button dependent on status
  recordBtnColour: string;
  recordBtnRadius: any;


  private url = 'http://localhost:8765/api/v1/';



  @ViewChild('audio') audio: ElementRef;

  constructor(private http: HttpClient) {

  }

  onKeyUp(searchTerm) {
    this.noResults = '';
    console.log(searchTerm);
    this.addSearchHistory(searchTerm);
    this.http.get(this.url + 'query-pipelines/lucidfind-default/collections/lucidfind/select?q=' + searchTerm + '&wt=json')
      .subscribe(data => {
        this.d = data as JSON;
        if (data.hasOwnProperty('response')) {
          this.resp = this.d.response.docs as JSON;
          this.numberOfResults = this.d.response.numFound;
        }
        console.log(data);
        console.log(this.resp);

      });
    console.log(this.numberOfResults);
    console.log('Search History: ' + this.searchHistory);
  }

  ngAfterViewInit() {
    this.recordStatus = true;
    this.setRecordNotActive();
    this.numberOfResults =0;
  this.search = 'Enter a search term';

    setTimeout(() => { if (this.search === 'Enter a search term') {
      this.search = 'or click the record button to search via voice :)';
    } }, 3000);


  }



  recordPress(this) {

    if (this.recordStatus === true) {

      console.log('Record Button pressed');
      this.setRecordActive();

      let constraints = {audio: true};
      navigator.mediaDevices.getUserMedia(constraints)
        .then(function(stream) {
          var audioTracks = stream.getAudioTracks()
          console.log('Got stream with constraints:', constraints);
          console.log('Using Audio device: ' + AudioTrack[0].label);
          this.stream = stream;

          stream.oninactive = function() {
            console.log('Stream ended');
          };
          console.log(stream); // make variable available to console

        })
        .catch(function(error) {
          // ...
        });

      this.startRecording();
      this.recordStatus = false;
    } else if (this.recordStatus === false) {
      this.setRecordNotActive();
      this.stopRecording(function() {
        let blob = this.getBlob();

        let file = new File([blob], 'file.wav', {
          type: 'audio/wav'
        });
        console.log('FILE' + file);

        let formData = new FormData();
        formData.append('file', file); // upload "File" object rather than a "Blob"
        // this.uploadToServer(formData);
      });
      this.clearUpForNextRecord();
      // stream.close();

      this.recordStatus = true;
    }
  }


  getResults(searchTerm)
  {
    this.searchHistory.push(searchTerm);
    this.http.get(this.url + 'query-pipelines/lucidfind-default/collections/lucidfind/select?q=' + searchTerm + '&wt=json')
      .subscribe(data => {
        this.d = data as JSON;
        if (data.hasOwnProperty('response')) {
          this.resp = this.d.response.docs;
        } else {
          console.log('No Response found');
        }


        console.log(data);
        console.log(this.resp);

        if (this.resp.length === 0) {
          console.log('NADA');
          this.noResults = 'Could not find any results, try reforming your query.';
        }

      });
  }

  toggleControls() {
    let audio: HTMLAudioElement = this.audio.nativeElement;
    audio.muted = !audio.muted;
    audio.controls = !audio.controls;
    audio.autoplay = !audio.autoplay;
  }



  errorCallback() {
    //handle error here
  }


  successCallback(stream: MediaStream) {

    var options = {
      type: 'audio',
      // recorderType: StereoAudioRecorder,
      audio: 'audio/wav',
      mimeType: 'audio/wav',
      numberOfChannels: 1,
      desiredSampRate: 16000,
      checkForInactiveTracks: true
    };
    this.recordRTC = RecordRTC(stream, options);
    this.recordRTC.startRecording();
    // let audio: HTMLAudioElement = this.audio.nativeElement;
    // audio.src = window.URL.createObjectURL(stream);
    // this.toggleControls();
  }

  startRecording() {
    let mediaConstraints = {
       audio: true,
      mimeType: 'audio/wav'
    };

    navigator.mediaDevices
      .getUserMedia(mediaConstraints)
      .then(this.successCallback.bind(this), this.errorCallback.bind(this));


  }



  stopRecording() {
    let recordRTC = this.recordRTC;
    recordRTC.stopRecording(this.processVideo.bind(this));

    // stream.getAudioTracks().forEach(track => track.stop());
    // this.download();
  }




  uploadToServer(blob) {
    let uploadLocation = this.url + 'query-pipelines/lucidfind-voicesearch/collections/lucidfind/select?wt=json';
    let body = {'data': blob};
    let header = {headers: {
        'Content-Type': 'audio/wav'
      }};
    this.http.post(uploadLocation, blob, {headers: {'Content-Type': 'audio/wav'}} )
      .subscribe(data => {
        this.d = data as JSON;
        let d = this.d;
        console.log('d' + this.d)
        if (d.hasOwnProperty('response')) {
          console.log('Response Found');
          this.resp = d.response.docs;
        } else {
          console.log('No Response found');
        }

        if (d.hasOwnProperty('fusion')) {
          this.googleResponse = d.fusion.q;
          this.searchHistory.push(this.googleResponse);
          this.search = this.googleResponse;
          console.log('FUSION ' + this.googleResponse);
        } else {
          console.log('No Response found');
        }



        console.log(data);
        console.log(this.resp);

        if (this.resp.length === 0) {
          console.log('NADA');
          this.noResults = 'Could not find any results, try reforming your query.';
        }

      });
  }

  processVideo(audioVideoWebMURL) {
    // let audio: HTMLVideoElement = this.audio.nativeElement;
    let recordRTC = this.recordRTC;
    // audio.src = audioVideoWebMURL;
    // this.toggleControls();
     this.recordedBlob = recordRTC.getBlob();
     this.uploadToServer(recordRTC.blob);


    // recordRTC.getDataURL(function (dataURL) { window.open(dataURL);
    // console.log(dataURL);
    // });
    console.log(this.recordedBlob);
    console.log(audioVideoWebMURL);
  }

  clearUpForNextRecord(){
    // this.recordRTC = null;
    this.recordRTC.clearRecordedData();
    // this.stream.close();
    // this.stream = null;
  }

  getRecordColour() {
    return this.recordBtnColour;
  }

  getRecordBtnRadius() {
    return this.recordBtnRadius;
  }

  setRecordActive() {
    this.recordBtnColour = 'green';
    this.recordBtnRadius = '10%';
  }

  setRecordNotActive() {
    this.recordBtnColour = 'red';
    this.recordBtnRadius = '50%';
  }

  addSearchHistory(searchTerm){
    let s = this.searchHistory;
   let size = this.searchHistory.length;

   if (size === 5) {
      s.shift();
   }

   s.push(searchTerm);
  }

}
