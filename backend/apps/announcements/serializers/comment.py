from rest_framework import serializers
# CHANGE THIS LINE:
from apps.classrooms.models import Comment 

class CommentSerializer(serializers.ModelSerializer):
    author_name = serializers.ReadOnlyField(source='user.name') 
    
    class Meta:
        model = Comment
        fields = ['id', 'author_name', 'text', 'video', 'ai_text', 'reply', 'created_at']