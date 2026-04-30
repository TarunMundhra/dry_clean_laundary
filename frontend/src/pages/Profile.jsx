import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '../api/axios';

const Profile = ({ user }) => {
  const queryClient = useQueryClient();
  const [username, setUsername] = useState(user?.username || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    setUsername(user?.username || '');
    setAvatar(user?.avatar || '');
  }, [user]);

  const updateProfileMutation = useMutation({
    mutationFn: async (payload) => {
      const response = await axiosInstance.patch('auth/user/', payload);
      return response.data;
    },
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(['user'], updatedUser);
      setFeedback({ type: 'success', message: 'Profile updated successfully.' });
    },
    onError: (error) => {
      setFeedback({
        type: 'error',
        message: error?.response?.data?.detail || 'Failed to update profile.',
      });
    },
  });

  const becomeCreatorMutation = useMutation({
    mutationFn: async () => {
      const response = await axiosInstance.post('auth/become-creator/');
      return response.data;
    },
    onSuccess: (result) => {
      if (result?.user) {
        queryClient.setQueryData(['user'], result.user);
      }
      setFeedback({ type: 'success', message: result?.detail || 'You are now a creator.' });
    },
    onError: (error) => {
      setFeedback({
        type: 'error',
        message: error?.response?.data?.detail || 'Failed to upgrade role.',
      });
    },
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    setFeedback(null);
    updateProfileMutation.mutate({ username, avatar: avatar || null });
  };

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
      <h2 className="mb-6 text-2xl font-bold">Profile</h2>

      {feedback && (
        <div
          className={`mb-4 rounded-lg border p-3 text-sm ${
            feedback.type === 'success'
              ? 'border-green-200 bg-green-50 text-green-700'
              : 'border-red-200 bg-red-50 text-red-700'
          }`}
        >
          {feedback.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
          <input
            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-gray-700"
            value={user?.email || ''}
            disabled
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Role</label>
          <input
            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-gray-700"
            value={user?.role || ''}
            disabled
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Name</label>
          <input
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Avatar URL</label>
          <input
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
            value={avatar || ''}
            onChange={(event) => setAvatar(event.target.value)}
            placeholder="https://..."
          />
        </div>

        {avatar && (
          <div className="pt-2">
            <p className="mb-2 text-xs uppercase tracking-wide text-gray-500">Preview</p>
            <img
              src={avatar}
              alt="Avatar preview"
              className="h-16 w-16 rounded-full border border-gray-200 object-cover"
              onError={() => setFeedback({ type: 'error', message: 'Avatar URL could not be loaded.' })}
            />
          </div>
        )}

        <button
          type="submit"
          disabled={updateProfileMutation.isPending}
          className="rounded-lg bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
        >
          {updateProfileMutation.isPending ? 'Saving...' : 'Save Profile'}
        </button>

        {user?.role !== 'creator' && (
          <button
            type="button"
            onClick={() => becomeCreatorMutation.mutate()}
            disabled={becomeCreatorMutation.isPending}
            className="ml-3 rounded-lg border border-purple-300 bg-purple-50 px-5 py-2 font-medium text-purple-700 hover:bg-purple-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {becomeCreatorMutation.isPending ? 'Upgrading...' : 'Become Creator'}
          </button>
        )}
      </form>
    </div>
  );
};

export default Profile;
