from rest_framework import serializers
from ..models.classroom import Classroom


class StudentClassSerializer(serializers.ModelSerializer):
    teacher_name = serializers.CharField(source="teacher.name")

    class Meta:
        model = Classroom
        fields = ["id", "title", "code", "teacher_name"]


class EnrollClassSerializer(serializers.Serializer):
    title = serializers.CharField()
    code = serializers.CharField()
