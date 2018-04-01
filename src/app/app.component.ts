import {Component, OnInit, ViewChild, AfterViewInit, ElementRef, Inject} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import * as RecordRTC from '../assets/recordrtc';
// import StereoAudioRecorder = require('recordrtc/dev/StereoAudioRecorder.js');
// import Recorder = require('recorder-js');

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})


export class AppComponent {
  title = 'Fusion Google Voice Search Demo';
  d: any;
  // API A
  nameOfApiA: String;
  respA: any;
  public googleResponse: String;
  public googleDocuments: any;

  public searchHistoryA = [];
  numberOfResultsA: number;
  public searchA: String;
  // API B
  nameOfApiB: String;
  respB: any;
  public ibmResponse: String;
  public ibmDocuments: any;
  public searchHistoryB = [];
  numberOfResultsB: number;
  public searchB: String;
  noResults: string;
  recordStatus: boolean;
  votingStatus: boolean;
  recordRTC: any;
  app = this;
  stream: any;
  recordedBlob: any;
  apis = ['Google', 'IBM'];
  rand: string;
  panelOpenState: boolean = false;
  serverAddress = document.location.protocol + '//' + document.location.hostname; //Get Server IP Address
  // Style button dependent on status
  recordBtnColour: string;
  recordBtnRadius: any;


  private url = this.serverAddress + ':8765/api/v1/';


  @ViewChild('audio') audio: ElementRef;
  private jsonRequest: JSON;

  constructor(private http: HttpClient) {

  }

  ngAfterViewInit() {
    this.recordStatus = true;
    this.setRecordNotActive();
    this.numberOfResultsA = 0;
    this.numberOfResultsB = 0;
    this.votingStatus = true;
    this.rand = this.randomise();
    console.log('Fusion should be found at: ' + this.url);
  }


  randomise() {
    return this.apis[Math.floor(Math.random() * this.apis.length)];
  }

  recordPress(this) {

    if (this.recordStatus === true) {

      console.log('Record Button pressed');
      this.setRecordActive();

      const constraints = {audio: true};
      navigator.mediaDevices.getUserMedia(constraints)
        .then(function(stream) {
          const audioTracks = stream.getAudioTracks();
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
        const blob = this.getBlob();

        const file = new File([blob], 'file.wav', {
          type: 'audio/wav'
        });
        console.log('FILE' + file);

        const formData = new FormData();
        formData.append('file', file); // upload "File" object rather than a "Blob"
        // this.uploadToServer(formData);
      });
      this.clearUpForNextRecord();
      this.recordStatus = true;
      this.votingStatus = false; // Allow user to vote
    }
  }


  toggleControls() {
    const audio: HTMLAudioElement = this.audio.nativeElement;
    audio.muted = !audio.muted;
    audio.controls = !audio.controls;
    audio.autoplay = !audio.autoplay;
  }



  errorCallback() {
    //handle error here
  }


  successCallback(stream: MediaStream) {

    const options = {
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
    const mediaConstraints = {
       audio: true,
      mimeType: 'audio/wav'
    };

    navigator.mediaDevices
      .getUserMedia(mediaConstraints)
      .then(this.successCallback.bind(this), this.errorCallback.bind(this));


  }


  stopRecording() {
    const recordRTC = this.recordRTC;
    recordRTC.stopRecording(this.processVideo.bind(this));

    this.rand = this.randomise();

  }


  uploadToServerA(blob) {
    const uploadLocation = this.url + 'query-pipelines/lucidfind-voicesearch/collections/lucidfind/select?wt=json';
    const body = {'data': blob};
    const header = {headers: {
        'Content-Type': 'audio/wav'
      }};
    this.http.post(uploadLocation, blob, {headers: {'Content-Type': 'audio/wav'}} )
      .subscribe(data => {
        this.d = data as JSON;
        const d = this.d;
        console.log('d' + this.d);
        if (d.hasOwnProperty('response')) {
          console.log('Response Found');
          this.googleDocuments = d.response.docs;
        } else {
          console.log('No Response found');
        }

        if (d.hasOwnProperty('responseHeader')) {
          this.googleResponse = d.responseHeader.params.q;
          console.log('FUSION ' + this.googleResponse);
        } else {
          //No response from API
        }



        console.log(data);
        console.log(this.respA);

        if (this.googleDocuments.length === 0) {
          this.noResults = 'Could not find any results, try reforming your query.';
        }

        this.setAandB();
      });
  }

  uploadToServerB(blob) {
    const uploadLocation = this.url + 'query-pipelines/ibm/collections/lucidfind/select?wt=json';
    const body = {'data': blob};
    const header = {headers: {
        'Content-Type': 'audio/wav'
      }};
    this.http.post(uploadLocation, blob, {headers: {'Content-Type': 'audio/wav'}} )
      .subscribe(data => {
        this.d = data as JSON;
        const d = this.d;
        console.log('d' + this.d);

        if (d.hasOwnProperty('responseHeader')) {
          this.ibmResponse = d.responseHeader.params.q;
          console.log('FUSION ' + this.ibmResponse);
        } else {
          //No response from API
        }

        if (d.hasOwnProperty('response')) {
          console.log('Response Found');
          this.ibmDocuments = d.response.docs;
        } else {
          console.log('No Response found');
        }

        console.log(data);

        if (this.ibmDocuments.length === 0) {
          this.noResults = 'Could not find any results, try reforming your query.';
        }

        this.setAandB();
      });
  }

  processVideo(audioVideoWebMURL) {
    // let audio: HTMLVideoElement = this.audio.nativeElement;
    const recordRTC = this.recordRTC;
    // audio.src = audioVideoWebMURL;
    // this.toggleControls();
     this.recordedBlob = recordRTC.getBlob();
     this.uploadToServerA(recordRTC.blob);
    this.uploadToServerB(recordRTC.blob);

    // recordRTC.getDataURL(function (dataURL) { window.open(dataURL);
    // console.log(dataURL);
    // });
    console.log(this.recordedBlob);
    console.log(audioVideoWebMURL);
  }

  clearUpForNextRecord() {
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

  addSearchHistory(searchTerm, searchHistory: any) {
   const size = searchHistory.length;

   if (size === 5) {
      searchHistory.shift();
   }

   searchHistory.push(searchTerm);
  }

  voteButtonClicked(value) {
    let api;
    if (value === 'A') {
      api = this.nameOfApiA;
    } else if (value === 'Both the Same') {
      api = 'Both the Same';
    } else if (value === 'B') {
      api = this.nameOfApiB;
    }

    this.votingStatus = true; // Disable Voting
    this.postToGoogleSheet(api, this.googleResponse, this.ibmResponse);

  }

  postToGoogleSheet(winner, googleResult, ibmResult) {
    const uploadLocation = 'https://script.google.com/macros/s/AKfycbxzfY3bMlpPqFxj4RSHr1LLFO2m0ps9J_y_TazqboFPbkDDnF8/exec?Winner=' + winner + '&Google=' + googleResult + '&Ibm=' + ibmResult ;

    //Figure out which API won
    if (winner === 'A') {
      winner = this.nameOfApiA;
    } else if (winner === 'B') {
      winner = this.nameOfApiB;
    }

    this.http.post(uploadLocation, {})
      .subscribe(data => {
        this.d = data as JSON;
      });
  }

  setAandB() {
    let app = this;
    const random = this.rand;
    this.nameOfApiA = random;


    if (random === 'Google') {
      app.searchA = this.googleResponse;
      app.respA = this.googleDocuments;
      app.numberOfResultsA = this.googleDocuments.length;
      app.searchHistoryA.push(this.googleResponse);
      app.nameOfApiB = 'IBM';
      app.searchB = this.ibmResponse;
      app.respB = this.ibmDocuments;

      app.numberOfResultsB = this.ibmDocuments.length;
      app.searchHistoryB.push(this.ibmResponse);

    } else if (random === 'IBM') {
      app.nameOfApiB = 'Google';
      app.searchB = this.googleResponse;
      app.respB = this.googleDocuments;
      app.numberOfResultsB = this.googleDocuments.length;
      app.searchHistoryB.push(this.googleResponse);

      app.searchA = this.ibmResponse;
      app.respA = this.ibmDocuments;
      app.numberOfResultsA = this.ibmDocuments.length;
      app.searchHistoryA.push(this.ibmResponse);
    }
  }




}
