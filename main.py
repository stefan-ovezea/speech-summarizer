import os
from flask import Flask, request, render_template

import speech_recognition as sr
from pydub import AudioSegment
from pydub.silence import split_on_silence

from sumy.parsers.plaintext import PlaintextParser
from sumy.nlp.tokenizers import Tokenizer
from sumy.summarizers.lsa import LsaSummarizer
from sumy.summarizers.lex_rank import LexRankSummarizer
from sumy.summarizers.luhn import LuhnSummarizer
from sumy.summarizers.text_rank import TextRankSummarizer
from sumy.nlp.stemmers import Stemmer
from sumy.utils import get_stop_words

from werkzeug.utils import secure_filename

LANGUAGE = "english"
ALLOWED_EXTENSIONS = {'mp3', 'mp4', 'wav'}
UPLOAD_FOLDER = os.path.dirname(os.path.abspath('./uploads'))
TEMPLATE_FOLDER = os.path.abspath('./speech-summarizer-app/dist/speech-summarizer-app/')

app = Flask(__name__, template_folder=TEMPLATE_FOLDER, static_folder=TEMPLATE_FOLDER, static_url_path="")
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config["DEBUG"] = True


@app.route('/')
def home():
    return render_template('index.html')


@app.route('/summarize-audio', methods=['POST'])
def summarize_audio():
    if request.method == 'POST':
        print(request.form['algorithm'])
        if 'file' not in request.files:
            return error("File not found")
        file = request.files['file']
        if file.filename == '':
            return error("No file uploaded")
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            text = get_large_audio_transcription(filename)
            os.remove(filename)
            return summarize(text, request.form['sentences'], request.form['algorithm'])
        else:
            return error('Allowed file types are mp3, mp4, wav')


@app.route('/summarize-text', methods=['POST'])
def summarize_text():
    if request.method == 'POST':
        return summarize(request.get_json()['text'])
    else:
        return error('Method not allowed')


def speech_to_text_sync(audio_file):
    r = sr.Recognizer()
    with sr.AudioFile(audio_file) as source:
        audio = r.record(source)
    try:
        text = r.recognize_google(audio)
        return text
    except sr.UnknownValueError:
        raise "Speech Recognition could not understand audio"


def get_large_audio_transcription(path):
    r = sr.Recognizer()

    folder_name = path.replace(".wav", "")


    sound = AudioSegment.from_wav(path)
    chunks = split_on_silence(sound,
                              min_silence_len=700,
                              silence_thresh=sound.dBFS - 20,
                              keep_silence=400,
                              )
    if not os.path.isdir(os.path.join("uploads", folder_name)):
        os.mkdir(os.path.join("uploads", folder_name))
    whole_text = ""
    for i, audio_chunk in enumerate(chunks, start=1):
        chunk_filename = os.path.join("uploads", folder_name, f"chunk{i}.wav")
        audio_chunk.export(chunk_filename, format="wav")
        with sr.AudioFile(chunk_filename) as source:
            audio_listened = r.record(source)
            try:
                text = r.recognize_google(audio_listened)
            except sr.UnknownValueError as e:
                print("Error:", str(e))
            else:
                text = f"{text.capitalize()}. "
                print(" -- :", text)
                whole_text += text
    return whole_text


def summarize(doc, sentences_count=3, algorithm='LsaSummarizer'):
    stemmer = Stemmer(LANGUAGE)
    stemmer.stop_words = get_stop_words(LANGUAGE)
    summarizer = globals()[algorithm](stemmer)
    parser = PlaintextParser.from_string(doc, Tokenizer(LANGUAGE))

    summary = []
    for sentence in summarizer(parser.document, sentences_count):
        summary.append(sentence._text)
    return {
        'summary': summary,
        'fullText': sentence._text
    }


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def error(message):
    return {
        'message': message
    }

if __name__ == '__main__':
    app.run()
