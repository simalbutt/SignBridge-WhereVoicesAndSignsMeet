from django.apps import AppConfig

class TextToGlossConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.text_to_gloss'

    def ready(self):
        # Preload the model when Django starts
        import os
        from django.conf import settings
        if not os.environ.get('RUN_MAIN'):
            # Only load once when the server starts
            from .services.gloss_service import text_to_gloss_service
            # The service will load the model in its __init__
            pass