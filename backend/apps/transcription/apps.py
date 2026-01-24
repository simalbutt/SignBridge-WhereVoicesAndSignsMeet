from django.apps import AppConfig

class TranscriptionConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.transcription"

    def ready(self):
        from .services.whisper_service import get_model
        try:
            get_model()
        except Exception as e:
            print("Whisper preload failed:", e)
