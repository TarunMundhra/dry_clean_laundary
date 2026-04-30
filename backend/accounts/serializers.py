from rest_framework import serializers
from django.contrib.auth import get_user_model

# This safely grabs your CustomUser model
User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'role', 'avatar')
        read_only_fields = ('id', 'email', 'role')