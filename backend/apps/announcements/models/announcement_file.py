from django.db import models
from .announcement import Announcement

class AnnouncementFile(models.Model):
    announcement = models.ForeignKey(
        Announcement,
        on_delete=models.CASCADE,
        related_name="files"
    )

    file = models.FileField(upload_to="announcements/files/")
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"File for announcement {self.announcement.id}"
