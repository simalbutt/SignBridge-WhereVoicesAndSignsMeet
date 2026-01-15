from django.db import models
from apps.accounts.models import User
from .announcement import Announcement

class Comment(models.Model):
    announcement = models.ForeignKey(
        Announcement,
        on_delete=models.CASCADE,
        related_name="comments"
    )
    author = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="comments"
    )

    text = models.TextField(blank=True)
    video = models.FileField(
        upload_to="comments-videos/",
        blank=True,
        null=True
    )
    
    reply = models.TextField(
        blank=True,  
        null=True,   
        help_text="Teacher reply to this comment"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Comment by {self.author.email}"
