from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q

from .models import Session, Booking
from .serializers import SessionSerializer, BookingSerializer
from .permissions import IsCreatorRole, IsSessionOwner, IsUserRole

class SessionViewSet(viewsets.ModelViewSet):
    """
    Anyone can view sessions, but you must be logged in to create one.
    """
    queryset = Session.objects.all().order_by('-start_time')
    serializer_class = SessionSerializer

    def get_queryset(self):
        base_qs = Session.objects.all().order_by('-start_time')

        if self.action == 'list':
            return base_qs.filter(is_active=True)

        if self.action == 'retrieve':
            if self.request.user.is_authenticated and getattr(self.request.user, 'role', None) == 'creator':
                return base_qs.filter(Q(is_active=True) | Q(creator=self.request.user))
            return base_qs.filter(is_active=True)

        if self.action == 'mine':
            return base_qs.filter(creator=self.request.user)

        return base_qs

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        if self.action == 'create':
            return [permissions.IsAuthenticated(), IsCreatorRole()]
        return [permissions.IsAuthenticated(), IsCreatorRole(), IsSessionOwner()]

    def perform_create(self, serializer):
        # Automatically assign the logged-in user as the creator
        serializer.save(creator=self.request.user)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated, IsCreatorRole])
    def mine(self, request):
        sessions = self.get_queryset().filter(creator=request.user)
        serializer = self.get_serializer(sessions, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated, IsCreatorRole], url_path='mine-bookings')
    def mine_bookings(self, request):
        bookings = Booking.objects.filter(session__creator=request.user).order_by('-booked_at')
        serializer = BookingSerializer(bookings, many=True)
        return Response(serializer.data)


class BookingViewSet(viewsets.ModelViewSet):
    """
    You must be logged in to view or create bookings.
    Users only see their own bookings.
    """
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated, IsUserRole]

    def get_queryset(self):
        # Security: Only return bookings belonging to the user making the request
        return Booking.objects.filter(user=self.request.user).order_by('-booked_at')

    def perform_create(self, serializer):
        # Automatically assign the logged-in user to the booking
        serializer.save(user=self.request.user)