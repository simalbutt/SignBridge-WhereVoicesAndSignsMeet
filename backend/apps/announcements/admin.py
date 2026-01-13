from django.contrib import admin
from .models import Announcement, AnnouncementFile, Comment
from apps.classrooms.models import Classroom

class AnnouncementFileInline(admin.TabularInline):
    model = AnnouncementFile
    extra = 1
    readonly_fields = ('id',)

class CommentInline(admin.TabularInline):
    model = Comment
    extra = 1
    readonly_fields = ('id', 'created_at')
    fields = ('author', 'text', 'reply', 'video', 'created_at')  # include video field
    show_change_link = True

@admin.register(Announcement)
class AnnouncementAdmin(admin.ModelAdmin):
    list_display = ('heading', 'author', 'classroom', 'created_at')
    list_filter = ('classroom', 'created_at', 'author')
    search_fields = ('heading', 'text', 'author__username')
    inlines = [AnnouncementFileInline, CommentInline]
    ordering = ('-created_at',)

@admin.register(Classroom)
class ClassroomAdmin(admin.ModelAdmin):
    list_display = ('title', 'teacher', 'created_at')  
    search_fields = ('title', 'teacher__username')
    ordering = ('title',)
