from rest_framework import serializers
from ..models.classroom import Classroom

class ClassroomSerializer(serializers.ModelSerializer):
    teacher_name = serializers.CharField(source="teacher.name", read_only=True)

    class Meta:
        model = Classroom
        fields = ["id", "title", "code", "teacher", "teacher_name", "created_at"]
        read_only_fields = ["id", "teacher", "teacher_name", "created_at"]
