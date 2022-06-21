import os
from flask import Flask, request, render_template

import speech_recognition as sr

from sumy.parsers.plaintext import PlaintextParser
from sumy.nlp.tokenizers import Tokenizer
from sumy.summarizers.lsa import LsaSummarizer as Summarizer
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
        if 'file' not in request.files:
            return error("File not found")
        file = request.files['file']
        if file.filename == '':
            return error("No file uploaded")
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            text = speech_to_text_sync(filename)
            os.remove(filename)
            return summarize(text)
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


def summarize(doc, sentences_count=3):
    parser = PlaintextParser.from_string(doc, Tokenizer(LANGUAGE))
    summary = []
    for sentence in summarizer(parser.document, sentences_count):
        summary.append(sentence._text)
    return {
        'summary': summary
    }


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def error(message):
    return {
        'message': message
    }


def init_summarizer():
    stemmer = Stemmer(LANGUAGE)
    global summarizer
    stemmer.stop_words = get_stop_words(LANGUAGE)
    summarizer = Summarizer(stemmer)


if __name__ == '__main__':
    init_summarizer()
    app.run()
