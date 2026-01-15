from rest_framework import serializers
from apps.announcements.models import Comment

class CommentSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source="author.name", read_only=True)
    video_url = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ["id", "text", "video", "video_url", "reply", "author_name", "created_at"]
        read_only_fields = ["id", "author_name", "created_at", "reply"]

    def get_video_url(self, obj):
        if obj.video:
            request = self.context.get("request")
            return request.build_absolute_uri(obj.video.url)
        return None
