import { Component } from '@angular/core';
import {Http} from '@angular/http';
import {HttpClient} from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Fusion Google Voice Search Demo';
  posts: JSON;
  resp: JSON;
  private url = 'http://localhost:8765/api/v1/';
  constructor(private http: HttpClient) {

  }

  ngOnInit(): void {

    this.http.get(this.url + 'query-pipelines/lucidfind-default/collections/lucidfind/select?q=stackoverflow&wt=json')
      .subscribe(data => {
        this.posts = data as JSON;
        if (data.hasOwnProperty('response')) {
          this.resp = data.response.docs;
        }
        console.log(data);
        console.log(this.resp);

      });

  }
}

