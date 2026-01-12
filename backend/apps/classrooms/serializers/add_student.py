from rest_framework import serializers

class AddStudentSerializer(serializers.Serializer):
    email = serializers.EmailField()
