from flask import Flask, request, jsonify
from faster_whisper import WhisperModel
import tempfile

app = Flask(__name__)

model = WhisperModel("base", compute_type="int8")

@app.route("/transcribe", methods=["POST"])
def transcribe():
    audio = request.files["audio"]

    with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as f:
        audio.save(f.name)

        segments, _ = model.transcribe(f.name)

        text = ""
        for seg in segments:
            text += seg.text

    return jsonify({"text": text.strip()})

if __name__ == "__main__":
    app.run(port=5001)
