from django.db import models
from django.conf import settings
from apps.announcements.models import Announcement 

class Comment(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    announcement = models.ForeignKey(Announcement, on_delete=models.CASCADE, related_name='announcement_comments')
    video = models.FileField(upload_to='comments-videos/', null=True, blank=True)
    ai_text = models.TextField(blank=True, null=True) 
    text = models.TextField(blank=True, null=True)
    reply = models.TextField(blank=True, null=True) 
    created_at = models.DateTimeField(auto_now_add=True)