from rest_framework import serializers
from apps.announcements.models import Comment

class CommentSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source="author.name", read_only=True)  
    video = serializers.FileField(required=False, allow_null=True)  

    class Meta:
        model = Comment
        fields = [
            "id",
            "text",
            "video",
            "reply",
            "author_name",
            "created_at",
        ]
