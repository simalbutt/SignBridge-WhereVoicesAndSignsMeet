from django.contrib import admin
from .models import Comment

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    # This helps you see the AI results directly in the dashboard
    list_display = ('user', 'announcement', 'ai_text', 'created_at')
