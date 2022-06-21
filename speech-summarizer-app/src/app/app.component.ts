import {Component} from '@angular/core';
import {FormControl, FormGroup} from "@angular/forms";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'speech-summarizer-app';

  form = new FormGroup({
    file: new FormControl('')
  });


  constructor() {
  }

  startRecognition() {

  }
}
