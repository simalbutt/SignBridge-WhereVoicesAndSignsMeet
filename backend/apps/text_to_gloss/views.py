from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import JSONParser
from .services.gloss_service import text_to_gloss_service
from ..utils.response import api_response

class TextToGlossView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [JSONParser]

    def post(self, request):
        """
        Convert English text to ASL Gloss
        Expected payload: {"text": "Your English sentence here"}
        """
        text = request.data.get('text', '').strip()
        
        if not text:
            return api_response(
                message="Text is required",
                success=False,
                status=400,
                errors={"text": ["This field is required"]}
            )

        try:
            # Translate text to gloss
            gloss = text_to_gloss_service.translate_to_gloss(text)
            
            return api_response(
                message="Text converted to gloss successfully",
                success=True,
                data={
                    "original_text": text,
                    "gloss": gloss
                },
                status=200
            )
        except Exception as e:
            return api_response(
                message=f"Failed to convert text: {str(e)}",
                success=False,
                status=500,
                errors={"error": str(e)}
            )


class BatchTextToGlossView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [JSONParser]

    def post(self, request):
        """
        Convert multiple English texts to ASL Gloss
        Expected payload: {"texts": ["Sentence 1", "Sentence 2", ...]}
        """
        texts = request.data.get('texts', [])
        
        if not texts or not isinstance(texts, list):
            return api_response(
                message="Texts array is required",
                success=False,
                status=400,
                errors={"texts": ["A non-empty array is required"]}
            )

        try:
            results = []
            for text in texts:
                gloss = text_to_gloss_service.translate_to_gloss(text)
                results.append({
                    "original_text": text,
                    "gloss": gloss
                })
            
            return api_response(
                message="Texts converted to gloss successfully",
                success=True,
                data={"results": results},
                status=200
            )
        except Exception as e:
            return api_response(
                message=f"Failed to convert texts: {str(e)}",
                success=False,
                status=500,
                errors={"error": str(e)}
            )