import whisper
import threading
import warnings
import os

_model = None
_model_lock = threading.Lock()
_transcribe_lock = threading.Lock()


def get_model():
    global _model
    if _model is None:
        with _model_lock:
            if _model is None:
                print("Loading Whisper model...")
                with warnings.catch_warnings():
                    warnings.simplefilter("ignore")
                    _model = whisper.load_model("small")
                print(" Whisper model ready.")
    return _model


def transcribe_video(video_path):
    if not os.path.exists(video_path) or os.path.getsize(video_path) == 0:
        raise ValueError("Invalid or empty video file")

    model = get_model()
    with _transcribe_lock:
        print(" Whisper inference started")

        with warnings.catch_warnings():
            warnings.simplefilter("ignore")

            result = model.transcribe(
                video_path,
                verbose=False,
                fp16=False,
                condition_on_previous_text=False,
                temperature=0.0,    
                no_speech_threshold=0.6
            )

        print(" Whisper inference finished")

    sentences = []
    for seg in result.get("segments", []):
        text = seg["text"].strip()
        if not text:
            continue

        sentences.append({
            "text": text,
            "start": float(seg["start"]),
            "end": float(seg["end"]),
        })

    if not sentences:
        raise RuntimeError("No speech detected in video")

    transcript_text = " ".join(s["text"] for s in sentences)

    base, _ = os.path.splitext(video_path)
    transcript_path = base + "_transcript.txt"

    with open(transcript_path, "w", encoding="utf-8") as f:
        f.write(transcript_text)

    return {
        "text": transcript_text,
        "file_path": transcript_path,
        "sentences": sentences,
    }
