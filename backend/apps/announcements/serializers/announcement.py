from rest_framework import serializers
from apps.announcements.models import Announcement, AnnouncementFile
# Ensure this is importing the version we just fixed!
from .comment import CommentSerializer 

class AnnouncementFileSerializer(serializers.ModelSerializer):
    file = serializers.SerializerMethodField() 

    class Meta:
        model = AnnouncementFile
        fields = ["id", "file"]

    def get_file(self, obj):
        request = self.context.get("request")
        if request:
            return request.build_absolute_uri(obj.file.url)
        return obj.file.url


class AnnouncementSerializer(serializers.ModelSerializer):
    files = AnnouncementFileSerializer(many=True, read_only=True)
    # This 'comments' field will now include 'ai_text' 
    # because of the changes we made to CommentSerializer
    comments = CommentSerializer(many=True, read_only=True)
    author_name = serializers.CharField(source="author.name", read_only=True)

    class Meta:
        model = Announcement
        fields = [
            "id",
            "heading",
            "text",
            "author_name",
            "created_at",
            "files",
            "comments", # This now sends the AI string to the frontend
        ]