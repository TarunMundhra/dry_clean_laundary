from rest_framework import serializers
from .models import Session, Booking

class SessionSerializer(serializers.ModelSerializer):
    # We add this so React gets the actual username, not just an ID number
    creator_username = serializers.ReadOnlyField(source='creator.username')

    class Meta:
        model = Session
        fields = [
            'id', 'creator', 'creator_username', 'title', 
            'description', 'price', 'start_time', 'end_time', 'is_active'
        ]
        # We make 'creator' read-only so users can't forge sessions under someone else's name
        read_only_fields = ['creator']


class BookingSerializer(serializers.ModelSerializer):
    session_title = serializers.ReadOnlyField(source='session.title')
    user_username = serializers.ReadOnlyField(source='user.username')
    session_start_time = serializers.ReadOnlyField(source='session.start_time')
    session_end_time = serializers.ReadOnlyField(source='session.end_time')
    session_is_active = serializers.ReadOnlyField(source='session.is_active')

    class Meta:
        model = Booking
        fields = [
            'id',
            'user',
            'user_username',
            'session',
            'session_title',
            'session_start_time',
            'session_end_time',
            'session_is_active',
            'booked_at',
        ]
        read_only_fields = ['user']

    def validate(self, attrs):
        request = self.context.get('request')
        user = getattr(request, 'user', None)
        session = attrs.get('session')

        if user and session and Booking.objects.filter(user=user, session=session).exists():
            raise serializers.ValidationError('You have already booked this session.')

        if session and not session.is_active:
            raise serializers.ValidationError('This session is no longer available for booking.')

        return attrs