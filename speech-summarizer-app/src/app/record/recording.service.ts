import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import Recorder from 'recorderjs';

@Injectable({
  providedIn: 'root'
})
export class RecordingService {
  audioRecording: Blob;
  recorder: Recorder;

  constructor(private http: HttpClient) {}

  record(): Promise<void> {
    return new Promise((resolve) => {
      return navigator.mediaDevices.getUserMedia({ audio: true })
        .then((stream) => {
          const audioContext = new AudioContext();
          const input = audioContext.createMediaStreamSource(stream);
          this.recorder = new Recorder(input);
          this.recorder.record();
          return resolve();
          // const mediaRecorder = new MediaRecorder(stream);
          // mediaRecorder.start();
          // const audioChunks: Array<Blob> = [];
          // mediaRecorder.addEventListener("dataavailable", (event) => {
          //   audioChunks.push(event.data);
          // });
          //
          // mediaRecorder.addEventListener("stop", () => {
          //   this.audioRecording = new Blob(audioChunks);
          //   console.log(this.audioRecording.type);
          // })
          // return resolve(mediaRecorder);
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
    // mediaRecorder.stop();
    // return new Promise((resolve) => {
    //   return resolve(this.audioRecording);
    // });
  }
}
