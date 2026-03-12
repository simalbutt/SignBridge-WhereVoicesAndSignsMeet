from django.contrib import admin
from .models import Announcement, AnnouncementFile
from apps.classrooms.models import Classroom, Comment  # ADD 'Comment' HERE

class AnnouncementFileInline(admin.TabularInline):
    model = AnnouncementFile
    extra = 1
    readonly_fields = ('id',)

class CommentInline(admin.TabularInline):
    model = Comment
    extra = 1
    readonly_fields = ('id', 'created_at')
    # ADD 'ai_text' and 'user' (instead of author if you renamed it)
    fields = ('user', 'text', 'ai_text', 'reply', 'video', 'created_at') 
    show_change_link = True

@admin.register(Announcement)
class AnnouncementAdmin(admin.ModelAdmin):
    list_display = ('heading', 'author', 'classroom', 'created_at')
    list_filter = ('classroom', 'created_at', 'author')
    search_fields = ('heading', 'text', 'author__username')
    inlines = [AnnouncementFileInline, CommentInline]
    #inlines = [AnnouncementFileInline]  # Start with just files, then add comments after testing
    ordering = ('-created_at',)

@admin.register(Classroom)
class ClassroomAdmin(admin.ModelAdmin):
    list_display = ('title', 'teacher', 'created_at')  
    search_fields = ('title', 'teacher__username')
    ordering = ('title',)
