import {Component, OnInit, ViewChild, AfterViewInit, ElementRef} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {RecordRTCComponent} from './record-rtc/record-rtc.component';
const RecordRTC = require('recordrtc/RecordRTC.js');


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})


export class AppComponent {
  title = 'Fusion Google Voice Search Demo';
  posts: JSON;
  resp: any;
  noResults: string;
  recordStatus: boolean;
  recordRTC: any;
  app = this;
  stream: any;

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

  }



  onKeyDown

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

          let file = new File([blob], 'filename.webm', {
                  type: 'video/webm'
              });

           let formData = new FormData();
           formData.append('file', file); // upload "File" object rather than a "Blob"
           // this.uploadToServer(formData);
       });
      this.download();
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
      mimeType: 'audio/webm', // or video/webm\;codecs=h264 or video/webm\;codecs=vp9
      bitsPerSecond: 16000 // if this line is provided, skip above two
    };

      // this.stream = stream;

    this.recordRTC = RecordRTC(stream, options);
    this.recordRTC.startRecording();
    // let audio: HTMLAudioElement = this.audio.nativeElement;
    // audio.src = window.URL.createObjectURL(stream);
    // this.toggleControls();
  }

  startRecording() {
    let mediaConstraints = {
      audio: {
        mandatory: {
        }
      }, audio: true
    };

    navigator.mediaDevices
      .getUserMedia(mediaConstraints)
      .then(this.successCallback.bind(this), this.errorCallback.bind(this));


  }



  stopRecording() {
    let recordRTC = this.recordRTC;
    recordRTC.stopRecording(this.processVideo.bind(this));
    let stream = this.stream;
    stream.getAudioTracks().forEach(track => track.stop());
  }

  download() {
    this.recordRTC.save('audio.webm');
    this.recordRTC.writeToDisk();

  }

  uploadToServer(blob) {
    let uploadLocation = '';
    this.http.post(uploadLocation, blob)
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

  processVideo(audioVideoWebMURL) {
    // let audio: HTMLVideoElement = this.audio.nativeElement;
    let recordRTC = this.recordRTC;
    // audio.src = audioVideoWebMURL;
    // this.toggleControls();
    var recordedBlob = recordRTC.getBlob();
    recordRTC.getDataURL(function (dataURL) { });
    console.log(recordedBlob);
    console.log(audioVideoWebMURL);
  }

}

