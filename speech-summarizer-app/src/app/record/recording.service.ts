import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import Recorder from 'recorderjs';

@Injectable({
  providedIn: 'root'
})
export class RecordingService {
  recorder: Recorder;

  constructor() {}

  record(): Promise<void> {
    return new Promise((resolve) => {
      return navigator.mediaDevices.getUserMedia({ audio: true })
        .then((stream) => {
          const audioContext = new AudioContext();
          const input = audioContext.createMediaStreamSource(stream);
          this.recorder = new Recorder(input);
          this.recorder.record();
          return resolve();
        });
    });
  }

  stopRecording(): any {
    this.recorder.stop();
    return new Promise((resolve) => {
      this.recorder.exportWAV((blob) => {
        return resolve(blob);
      });
    });
  }
}
