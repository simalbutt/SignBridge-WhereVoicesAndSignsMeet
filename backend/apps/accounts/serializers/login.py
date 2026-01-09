from rest_framework import serializers
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from ..models.user import User

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    role = serializers.ChoiceField(choices=[('student', 'Student'), ('teacher', 'Teacher')])

    def validate(self, data):
        email = data.get('email')
        password = data.get('password')
        role = data.get('role')
        user = authenticate(email=email, password=password)

        if not user:
            raise serializers.ValidationError("Invalid credentials")
        if user.role != role:
            raise serializers.ValidationError(f"Incorrect role for this account. You are registered as {user.role}.")

        refresh = RefreshToken.for_user(user)

        return {
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'role': user.role,
            'name': user.name,
        }
