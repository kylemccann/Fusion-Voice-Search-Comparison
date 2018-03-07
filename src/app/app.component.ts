import {Component, OnInit, ViewChild, AfterViewInit, ElementRef} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import RecordRTC = require('recordrtc');
import StereoAudioRecorder = require('recordrtc/dev/StereoAudioRecorder.js');
import Recorder = require('recorder-js');

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})


export class AppComponent {
  title = 'Fusion Google Voice Search Demo';
  posts: JSON;
  resp: any;
  googleResponse: any;
  noResults: string;
  recordStatus: boolean;
  recordRTC: any;
  app = this;
  stream: any;
  recordedBlob: any;
  public search : string;

  private url = 'http://localhost:8765/api/v1/';



  @ViewChild('audio') audio: ElementRef;

  constructor(private http: HttpClient) {

  }

  onKeyDown(searchTerm) {
    this.http.get(this.url + 'query-pipelines/lucidfind-default/collections/lucidfind/select?q='+ searchTerm +'&wt=json')
      .subscribe(data => {
        this.posts = data as JSON;
        if (data.hasOwnProperty('response')) {
          this.resp = data.response.docs;
        }
        console.log(data);
        console.log(this.resp);

      });
  }

  ngAfterViewInit() {
    this.recordStatus = true;
  this.search = 'Enter a search term';

    setTimeout(() => { if (this.search == 'Enter a search term') {
      this.search = 'or click the record button to search via voice :)';
    } }, 3000);


  }



  recordPress(this) {

    if (this.recordStatus === true) {
      console.log('Helllooooo');

      let constraints = {audio: true};
      navigator.mediaDevices.getUserMedia(constraints)
        .then(function(stream) {
          var videoTracks = stream.getVideoTracks();
          console.log('Got stream with constraints:', constraints);
          console.log('Using video device: ' + AudioTrack[0].label);
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
    } else {
      this.recordStatus = false;
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
      this.download();
      // this.uploadToServer();
    }
  }


  onKeyUp(searchTerm) {
    this.noResults = '';
    console.log(searchTerm);
    this.getResults(searchTerm);
  }

  getResults(searchTerm)
  {
    this.http.get(this.url + 'query-pipelines/lucidfind-default/collections/lucidfind/select?q=' + searchTerm + '&wt=json')
      .subscribe(data => {
        this.posts = data as JSON;
        if (data.hasOwnProperty('response')) {
          this.resp = data.response.docs;
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
      desiredSampRate: 16000
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

  download() {
    // this.recordRTC.save('audio.wav');
    // this.recordRTC.writeToDisk();

  }



  uploadToServer(blob) {
    let uploadLocation = this.url + 'query-pipelines/lucidfind-voicesearch/collections/lucidfind/select?wt=json';
    let body = {'data': blob};
    let header = {headers: {
        'Content-Type': 'audio/wav'
      }};
    this.http.post(uploadLocation, blob, {headers: {'Content-Type': 'audio/wav'}} )
      .subscribe(data => {
        this.posts = data as JSON;

        console.log('posts' + this.posts)
        if (data.hasOwnProperty('response')) {
          console.log('Response Found');
          this.resp = data.response.docs;
        } else {
          console.log('No Response found');
        }

        if (data.hasOwnProperty('fusion')) {
          this.googleResponse = data.fusion.q;
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

}
