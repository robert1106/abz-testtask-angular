import { Component, OnInit } from '@angular/core';
import {HttpClient} from "@angular/common/http";

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.sass']
})
export class HomePageComponent implements OnInit {

  constructor(
    private http: HttpClient,
  ) { }

  data: any = {};

  ngOnInit(): void {
    this.http.get('https://frontend-test-assignment-api.abz.agency/api/v1/users/1', {responseType: "json"})
      .subscribe((res) => {
        this.data = res;
      })
  }

}
