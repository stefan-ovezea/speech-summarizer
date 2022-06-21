import {Component} from '@angular/core';
import {FormControl, FormGroup, Validator, Validators} from "@angular/forms";
import {SpeechService} from "./speech/services/speech.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'speech-summarizer-app';

  form = new FormGroup({
    file: new FormControl('', Validators.required),
    sentences: new FormControl(1),
    areas: new FormControl(''),
  });


  constructor(private speechService: SpeechService) {
  }

  startRecognition() {
    console.log(this.form.value);
    this.speechService.recognize(this.form.value).subscribe(data => {
      console.log(data);
    })

  }

  onSelect(event: Event) {
    const file = (event.target as any).files[0];
    this.form.patchValue({file: file});


  }
}
