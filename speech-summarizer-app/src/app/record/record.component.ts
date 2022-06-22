import { Component, OnInit } from '@angular/core';
import { RecordingService } from './recording.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-record',
  templateUrl: './record.component.html',
  styleUrls: ['./record.component.scss']
})
export class RecordComponent implements OnInit {
  mediaRecorder: MediaRecorder;

  constructor(private http: HttpClient, private recordingService: RecordingService) { }

  ngOnInit(): void {
  }

  start() {
    this.recordingService.record().then();
  }

  stop() {
    this.recordingService.stopRecording()
      .then((recording) => {
        const formData = new FormData();
        formData.append('file', recording, 'recording.wav');

        this.http.post('http://localhost:5000/summarize-audio', formData).subscribe(console.log);
      });
  }

}
