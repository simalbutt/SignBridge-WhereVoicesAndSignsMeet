from rest_framework import serializers
from apps.classrooms.models import Comment

class CommentSerializer(serializers.ModelSerializer):
    author_name = serializers.ReadOnlyField(source='user.username')
    video = serializers.FileField(required=False, allow_null=True, write_only=True)
    video_url = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = [
            'id',
            'author_name',
            'text',
            'video',
            'video_url',
            'ai_text',
            'reply',
            'created_at'
        ]

    def get_video_url(self, obj):
        if obj.video:
            request = self.context.get('request')
            return request.build_absolute_uri(obj.video.url) if request else obj.video.url
        return None