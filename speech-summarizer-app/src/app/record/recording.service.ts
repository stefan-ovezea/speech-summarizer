import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RecordingService {
  audioRecording: Blob;

  constructor() { }

  record(): Promise<MediaRecorder> {
    return new Promise((resolve) => {
      return navigator.mediaDevices.getUserMedia({ audio: true })
        .then((stream) => {
          const mediaRecorder = new MediaRecorder(stream);
          mediaRecorder.start();
          const audioChunks: Array<Blob> = [];
          mediaRecorder.addEventListener("dataavailable", (event) => {
            audioChunks.push(event.data);
          });

          mediaRecorder.addEventListener("stop", () => {
            this.audioRecording = new Blob(audioChunks, { 'type' : 'audio/wav' });
            console.log(this.audioRecording.type);
          })
          return resolve(mediaRecorder);
        });
    });
  }

  stopRecording(mediaRecorder: MediaRecorder): Promise<Blob> {
    mediaRecorder.stop();
    return new Promise((resolve) => {
      return resolve(this.audioRecording);
    });
  }
}
