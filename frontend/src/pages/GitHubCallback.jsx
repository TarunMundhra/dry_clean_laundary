import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '../api/axios';

const GitHubCallback = () => {
  const [searchParams] = useSearchParams();
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    const completeLogin = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const oauthError = searchParams.get('error');

      if (oauthError) {
        setError('GitHub login was cancelled or denied.');
        return;
      }

      if (!code) {
        setError('Missing GitHub authorization code.');
        return;
      }

      const expectedState = sessionStorage.getItem('github_oauth_state');
      sessionStorage.removeItem('github_oauth_state');

      if (expectedState && expectedState !== state) {
        setError('GitHub login state validation failed. Please try again.');
        return;
      }

      try {
        const redirectUri = `${window.location.origin}/auth/github/callback`;
        const response = await axiosInstance.post('auth/github/', {
          code,
          redirect_uri: redirectUri,
        });

        queryClient.setQueryData(['user'], response.data.user);
        navigate('/dashboard', { replace: true });
      } catch (requestError) {
        setError(
          requestError?.response?.data?.detail ||
            requestError?.message ||
            'GitHub login failed. Please try again.'
        );
      }
    };

    completeLogin();
  }, [navigate, queryClient, searchParams]);

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">
        <h2 className="mb-2 text-lg font-semibold">GitHub Login Failed</h2>
        <p className="mb-4 text-sm">{error}</p>
        <button
          type="button"
          onClick={() => navigate('/', { replace: true })}
          className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          Return Home
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 p-6 text-blue-700">
      Completing GitHub sign-in...
    </div>
  );
};

export default GitHubCallback;
