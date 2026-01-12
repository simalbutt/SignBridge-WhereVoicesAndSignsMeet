from rest_framework import serializers
from ..models.user import User
from apps.classrooms.models import StudentInvite, Enrollment

class SignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    invite_token = serializers.UUIDField(write_only=True, required=False)
    role = serializers.ChoiceField(
        choices=User.ROLE_CHOICES, required=False, default="student"
    )  

    class Meta:
        model = User
        fields = ["name", "email", "password", "role", "invite_token"]

    def validate(self, data):
        """Ensure role exists if no invite token"""
        if not data.get("invite_token") and not data.get("role"):
            raise serializers.ValidationError(
                {"role": "This field is required if no invite token is provided."}
            )
        return data

    def create(self, validated_data):
        invite_token = validated_data.pop("invite_token", None)
        password = validated_data.pop("password")

        if invite_token:
            validated_data["role"] = "student"

        user = User(**validated_data)
        user.set_password(password)
        user.save()

        if invite_token:
            try:
                invite = StudentInvite.objects.get(token=invite_token, is_used=False)
                Enrollment.objects.get_or_create(classroom=invite.classroom, student=user)
                invite.is_used = True
                invite.save()
            except StudentInvite.DoesNotExist:
                pass

        return user
