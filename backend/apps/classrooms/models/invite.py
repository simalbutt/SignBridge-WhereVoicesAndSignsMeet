import uuid
from django.db import models
from apps.accounts.models import User
from .classroom import Classroom

class StudentInvite(models.Model):
    email = models.EmailField()
    classroom = models.ForeignKey(Classroom, on_delete=models.CASCADE, related_name="invites")
    token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    is_used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Invite {self.email} → {self.classroom.title}"
