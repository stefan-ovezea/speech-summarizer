import os
from flask import Flask, render_template

template_folder = os.path.abspath('.')
print(os.path.abspath(''))
app = Flask(__name__, template_folder=template_folder)

@app.route('/')
def home():
    return render_template('./index.html')


if __name__ == '__main__':
    app.run()
