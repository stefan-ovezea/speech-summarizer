import {Component} from '@angular/core';
import {FormControl, FormGroup, Validator, Validators} from "@angular/forms";
import {SpeechService} from "./speech/services/speech.service";
import {RecordingService} from "./record/recording.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  recognitionStatus: RecognitionState = RecognitionState.NOT_STARTED;
  recognizedFileName: string = '';
  recognitionSummary: Array<string> = [];

  recordingInProgress: boolean = false;

  selectedTab: string = 'audio';

  form = new FormGroup({
    file: new FormControl('', Validators.required),
    sentences: new FormControl(1),
    algorithm: new FormControl('LsaSummarizer'),
  });


  constructor(private speechService: SpeechService, private recordingService: RecordingService) {
  }

  startRecognition() {
    this.recognitionStatus = RecognitionState.PENDING;
    this.speechService.recognize(this.form.value).subscribe(data => {
      this.recognitionStatus = RecognitionState.SUCCESS;
      this.recognitionSummary = data.summary;
    }, () => {
      this.recognitionStatus = RecognitionState.FAILED;
    })

  }

  onSelect(event: Event) {
    this.recognitionStatus = RecognitionState.NOT_STARTED;
    const file = (event.target as any).files[0];
    this.form.patchValue({file: file});
    this.recognizedFileName = file.name;
  }

  selectTab(name) {
    this.selectedTab = name;
  }


  start() {
    this.recordingService.record().then();
    this.recordingInProgress = true;
  }

  stop() {
    this.recordingInProgress = false;
    this.recordingService.stopRecording()
      .then((recording) => {
        this.form.patchValue({file: new File([recording], "recording.wav")});
        this.recognizedFileName = 'recording.wav';
      });
  }
}

enum RecognitionState {
  NOT_STARTED = 'NOT_STARTED',
  PENDING = 'PENDING',
  FAILED = 'FAILED',
  SUCCESS = 'SUCCESS',
}
