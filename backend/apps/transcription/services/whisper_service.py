import whisper
import os
FFMPEG_PATH = r"C:\ffmpeg-8.0.1-essentials_build\ffmpeg-8.0.1-essentials_build\bin"
os.environ["PATH"] = FFMPEG_PATH + os.pathsep + os.environ.get("PATH", "")

model = whisper.load_model("small")

def transcribe_video(video_path):
    """
    Transcribes video and returns text + saves transcript next to video file.
    Works reliably on Windows with ffmpeg.
    """
    result = model.transcribe(video_path)

    transcript_text = result["text"]

    base, _ = os.path.splitext(video_path)
    transcript_path = base + "_transcript.txt"

    with open(transcript_path, "w", encoding="utf-8") as f:
        f.write(transcript_text)

    return {
        "text": transcript_text,
        "file_path": transcript_path
    }
