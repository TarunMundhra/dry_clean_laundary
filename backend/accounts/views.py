import json
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Error
from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth import logout as django_logout
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from dj_rest_auth.registration.views import SocialLoginView
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import UserSerializer

User = get_user_model()


def _set_auth_cookies(response, refresh_token):
    auth_settings = getattr(settings, 'REST_AUTH', {})
    access_cookie = auth_settings.get('JWT_AUTH_COOKIE', 'access-token')
    refresh_cookie = auth_settings.get('JWT_AUTH_REFRESH_COOKIE', 'refresh-token')
    http_only = auth_settings.get('JWT_AUTH_HTTPONLY', True)
    secure_cookie = not settings.DEBUG

    response.set_cookie(
        access_cookie,
        str(refresh_token.access_token),
        httponly=http_only,
        secure=secure_cookie,
        samesite='Lax',
    )
    response.set_cookie(
        refresh_cookie,
        str(refresh_token),
        httponly=http_only,
        secure=secure_cookie,
        samesite='Lax',
    )


def _clear_auth_cookies(response):
    auth_settings = getattr(settings, 'REST_AUTH', {})
    access_cookie = auth_settings.get('JWT_AUTH_COOKIE', 'access-token')
    refresh_cookie = auth_settings.get('JWT_AUTH_REFRESH_COOKIE', 'refresh-token')
    cookie_path = auth_settings.get('JWT_AUTH_COOKIE_PATH', '/')
    cookie_domain = auth_settings.get('JWT_AUTH_COOKIE_DOMAIN')

    response.delete_cookie(access_cookie, path=cookie_path, domain=cookie_domain, samesite='Lax')
    response.delete_cookie(refresh_cookie, path=cookie_path, domain=cookie_domain, samesite='Lax')
    response.delete_cookie('sessionid', path='/', samesite='Lax')
    response.delete_cookie('csrftoken', path='/', samesite='Lax')


class GoogleLogin(SocialLoginView):
    adapter_class = GoogleOAuth2Adapter

    def post(self, request, *args, **kwargs):
        provider_cfg = settings.SOCIALACCOUNT_PROVIDERS.get('google', {})
        app_cfg = provider_cfg.get('APP', {})
        client_id = app_cfg.get('client_id')
        client_secret = app_cfg.get('secret')

        if not client_id or not client_secret:
            return Response(
                {'detail': 'Google OAuth is not configured on the server.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            return super().post(request, *args, **kwargs)
        except OAuth2Error:
            return Response(
                {'detail': 'Google token validation failed. Please try logging in again.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except ValueError as exc:
            if 'Model instances passed to related filters must be saved.' in str(exc):
                return Response(
                    {'detail': 'Google OAuth configuration mismatch. Contact support or retry shortly.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            raise


class GitHubLogin(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        code = request.data.get('code')
        redirect_uri = request.data.get('redirect_uri')

        if not code:
            return Response({'detail': 'Missing GitHub authorization code.'}, status=status.HTTP_400_BAD_REQUEST)

        provider_cfg = settings.SOCIALACCOUNT_PROVIDERS.get('github', {})
        app_cfg = provider_cfg.get('APP', {})
        client_id = app_cfg.get('client_id')
        client_secret = app_cfg.get('secret')

        if not client_id or not client_secret:
            return Response(
                {'detail': 'GitHub OAuth is not configured on the server.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        access_token = self._exchange_code_for_token(code, client_id, client_secret, redirect_uri)
        if not access_token:
            return Response({'detail': 'GitHub token exchange failed.'}, status=status.HTTP_400_BAD_REQUEST)

        profile = self._fetch_json('https://api.github.com/user', access_token)
        if not profile:
            return Response({'detail': 'Failed to fetch GitHub profile.'}, status=status.HTTP_400_BAD_REQUEST)

        email = profile.get('email')
        if not email:
            emails = self._fetch_json('https://api.github.com/user/emails', access_token)
            if isinstance(emails, list):
                primary_verified = next(
                    (item.get('email') for item in emails if item.get('primary') and item.get('verified')),
                    None,
                )
                email = primary_verified or next((item.get('email') for item in emails if item.get('email')), None)

        user = self._get_or_create_user(profile, email)
        refresh = RefreshToken.for_user(user)

        response = Response({'user': UserSerializer(user).data}, status=status.HTTP_200_OK)
        _set_auth_cookies(response, refresh)
        return response

    def _exchange_code_for_token(self, code, client_id, client_secret, redirect_uri):
        payload = {
            'client_id': client_id,
            'client_secret': client_secret,
            'code': code,
        }
        if redirect_uri:
            payload['redirect_uri'] = redirect_uri

        response = self._request_json(
            'https://github.com/login/oauth/access_token',
            method='POST',
            payload=payload,
        )
        if not isinstance(response, dict):
            return None
        return response.get('access_token')

    def _fetch_json(self, url, access_token):
        return self._request_json(
            url,
            method='GET',
            headers={
                'Authorization': f'Bearer {access_token}',
            },
        )

    def _request_json(self, url, method='GET', payload=None, headers=None):
        request_headers = {'Accept': 'application/json'}
        if headers:
            request_headers.update(headers)

        request_data = None
        if payload is not None:
            request_data = urlencode(payload).encode('utf-8')
            request_headers['Content-Type'] = 'application/x-www-form-urlencoded'

        req = Request(url=url, data=request_data, headers=request_headers, method=method)

        try:
            with urlopen(req, timeout=10) as resp:
                body = resp.read().decode('utf-8')
                return json.loads(body)
        except (HTTPError, URLError, TimeoutError, json.JSONDecodeError):
            return None

    def _get_or_create_user(self, profile, email):
        username_base = profile.get('login') or (email.split('@')[0] if email else 'github_user')
        avatar_url = profile.get('avatar_url')

        user = None
        if email:
            user = User.objects.filter(email__iexact=email).first()

        if not user:
            username = self._make_unique_username(username_base)
            user = User(username=username, email=email or '', avatar=avatar_url)
            user.set_unusable_password()
            user.save()
        else:
            if avatar_url and user.avatar != avatar_url:
                user.avatar = avatar_url
                user.save(update_fields=['avatar'])

        return user

    def _make_unique_username(self, base_username):
        cleaned_base = ''.join(ch for ch in base_username if ch.isalnum() or ch in ['_', '-'])
        candidate = cleaned_base or 'github_user'
        suffix = 1
        while User.objects.filter(username=candidate).exists():
            candidate = f'{cleaned_base}_{suffix}'
            suffix += 1
        return candidate


@method_decorator(csrf_exempt, name='dispatch')
class SafeLogoutView(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request, *args, **kwargs):
        # Kill Django session-backed auth first, then clear browser cookies.
        django_logout(request)
        response = Response({'detail': 'Logged out successfully.'}, status=status.HTTP_200_OK)
        _clear_auth_cookies(response)
        response['Cache-Control'] = 'no-store'
        return response

    def get(self, request, *args, **kwargs):
        return self.post(request, *args, **kwargs)


class BecomeCreatorView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user = request.user

        if getattr(user, 'role', None) == 'creator':
            return Response(
                {
                    'detail': 'You are already a creator.',
                    'user': UserSerializer(user).data,
                },
                status=status.HTTP_200_OK,
            )

        user.role = 'creator'
        user.save(update_fields=['role'])

        return Response(
            {
                'detail': 'Role upgraded to creator successfully.',
                'user': UserSerializer(user).data,
            },
            status=status.HTTP_200_OK,
        )