from django.db import models
from apps.accounts.models import User
from apps.classrooms.models.classroom import Classroom

class Announcement(models.Model):
    classroom = models.ForeignKey(
        Classroom,
        on_delete=models.CASCADE,
        related_name="announcements"
    )
    author = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="announcements"
    )

    heading = models.CharField(max_length=255, blank=True)
    text = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.heading} - {self.classroom.title}"
