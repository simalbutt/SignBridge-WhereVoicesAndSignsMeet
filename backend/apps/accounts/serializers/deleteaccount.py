from rest_framework import serializers
from ..models.user import User

class DeleteAccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = []
