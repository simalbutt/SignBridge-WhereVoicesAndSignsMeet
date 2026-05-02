import os
import re
from transformers import T5Tokenizer, T5ForConditionalGeneration
from django.conf import settings

class TextToGlossService:
    _instance = None
    _model = None
    _tokenizer = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(TextToGlossService, cls).__new__(cls)
        return cls._instance

    def __init__(self):
        if self._model is None:
            self.load_model()

    def load_model(self):
        """Load the T5 model and tokenizer"""
        model_path = os.path.join(settings.BASE_DIR, 'apps', 'text_to_gloss', 'model_files')
        
        try:
            self._tokenizer = T5Tokenizer.from_pretrained(model_path)
            self._model = T5ForConditionalGeneration.from_pretrained(model_path)
            print("Text-to-Gloss model loaded successfully!")
        except Exception as e:
            print(f"Error loading Text-to-Gloss model: {str(e)}")
            self._tokenizer = None
            self._model = None

    def clean_output(self, gloss):
        """Clean the generated gloss output"""
        gloss = re.sub(r'X-', '', gloss)   # remove "X-"
        gloss = gloss.replace("BE", "")    # remove "BE"
        gloss = gloss.replace("DESC-", "") # remove "DESC-"
        gloss = gloss.replace("  ", " ")   # remove double spaces
        return gloss.strip()

    def translate_to_gloss(self, text):
        """Translate English text to ASL Gloss"""
        if not self._model or not self._tokenizer:
            return "Model not loaded properly"

        try:
            # Prepare input text for the model
            input_text = "translate English to ASL Gloss: " + text
            input_ids = self._tokenizer(input_text, return_tensors="pt").input_ids

            # Generate gloss using the fine-tuned model
            outputs = self._model.generate(
                input_ids,
                max_length=50,
                num_beams=4,
                early_stopping=True
            )

            # Decode the generated tokens
            gloss_output = self._tokenizer.decode(outputs[0], skip_special_tokens=True)
            
            # Clean the output
            cleaned_gloss = self.clean_output(gloss_output)
            
            return cleaned_gloss if cleaned_gloss else text
            
        except Exception as e:
            print(f"Translation error: {str(e)}")
            return text

# Create a singleton instance
text_to_gloss_service = TextToGlossService()