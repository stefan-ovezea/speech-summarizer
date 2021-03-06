import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class SpeechService {

  constructor(private http: HttpClient) {
  }

  recognize(data: any): Observable<any> {
    const formData = new FormData();
    formData.append('file', data.file);
    formData.append('algorithm', data.algorithm);
    formData.append('sentences', data.sentences);

    return this.http.post('./summarize-audio', formData);
  }
}
