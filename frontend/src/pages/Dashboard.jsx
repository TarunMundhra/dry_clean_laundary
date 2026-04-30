import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '../api/axios';

const emptySessionForm = {
  title: '',
  description: '',
  price: '',
  start_time: '',
  end_time: '',
};

const toLocalDateTimeInput = (isoDateTime) => {
  if (!isoDateTime) return '';
  const date = new Date(isoDateTime);
  if (Number.isNaN(date.getTime())) return '';
  const tzOffsetMs = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - tzOffsetMs).toISOString().slice(0, 16);
};

const Dashboard = ({ user }) => {
  const queryClient = useQueryClient();
  const [sessionForm, setSessionForm] = useState(emptySessionForm);
  const [formError, setFormError] = useState(null);
  const [editingSessionId, setEditingSessionId] = useState(null);

  const creatorSessionsQuery = useQuery({
    queryKey: ['creator-sessions'],
    enabled: user?.role === 'creator',
    queryFn: async () => {
      const response = await axiosInstance.get('marketplace/sessions/mine/');
      return response.data;
    },
  });

  const creatorBookingsOverviewQuery = useQuery({
    queryKey: ['creator-bookings-overview'],
    enabled: user?.role === 'creator',
    queryFn: async () => {
      const response = await axiosInstance.get('marketplace/sessions/mine-bookings/');
      return response.data;
    },
  });

  const bookingsQuery = useQuery({
    queryKey: ['user-bookings'],
    enabled: user?.role === 'user',
    queryFn: async () => {
      const response = await axiosInstance.get('marketplace/bookings/');
      return response.data;
    },
  });

  const createSessionMutation = useMutation({
    mutationFn: async (payload) => {
      const response = await axiosInstance.post('marketplace/sessions/', payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creator-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      setSessionForm(emptySessionForm);
      setFormError(null);
    },
    onError: (error) => {
      setFormError(error?.response?.data?.detail || 'Failed to create session.');
    },
  });

  const deleteSessionMutation = useMutation({
    mutationFn: async (sessionId) => {
      await axiosInstance.delete(`marketplace/sessions/${sessionId}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creator-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });

  const toggleSessionActiveMutation = useMutation({
    mutationFn: async ({ sessionId, nextIsActive }) => {
      await axiosInstance.patch(`marketplace/sessions/${sessionId}/`, {
        is_active: nextIsActive,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creator-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });

  const updateSessionMutation = useMutation({
    mutationFn: async ({ sessionId, payload }) => {
      const response = await axiosInstance.patch(`marketplace/sessions/${sessionId}/`, payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creator-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      setEditingSessionId(null);
      setSessionForm(emptySessionForm);
      setFormError(null);
    },
    onError: (error) => {
      setFormError(error?.response?.data?.detail || 'Failed to update session.');
    },
  });

  const startEditingSession = (session) => {
    setEditingSessionId(session.id);
    setFormError(null);
    setSessionForm({
      title: session.title || '',
      description: session.description || '',
      price: session.price || '',
      start_time: toLocalDateTimeInput(session.start_time),
      end_time: toLocalDateTimeInput(session.end_time),
    });
  };

  const cancelEditingSession = () => {
    setEditingSessionId(null);
    setSessionForm(emptySessionForm);
    setFormError(null);
  };

  const handleCreateSession = (event) => {
    event.preventDefault();

    if (new Date(sessionForm.end_time) <= new Date(sessionForm.start_time)) {
      setFormError('End time must be after start time.');
      return;
    }

    const payload = {
      ...sessionForm,
      price: Number(sessionForm.price),
      start_time: new Date(sessionForm.start_time).toISOString(),
      end_time: new Date(sessionForm.end_time).toISOString(),
    };

    if (editingSessionId) {
      updateSessionMutation.mutate({ sessionId: editingSessionId, payload });
      return;
    }

    createSessionMutation.mutate(payload);
  };

  if (user?.role === 'creator') {
    const sessions = creatorSessionsQuery.data || [];

    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
          <h2 className="mb-4 text-2xl font-bold">Creator Dashboard</h2>
          <p className="mb-6 text-gray-600">
            {editingSessionId ? 'Edit your session details below.' : 'Create and manage your sessions from one place.'}
          </p>

          {formError && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {formError}
            </div>
          )}

          <form onSubmit={handleCreateSession} className="grid gap-4 md:grid-cols-2">
            <input
              className="rounded-lg border border-gray-300 px-3 py-2"
              placeholder="Session title"
              value={sessionForm.title}
              onChange={(event) => setSessionForm((prev) => ({ ...prev, title: event.target.value }))}
              required
            />
            <input
              className="rounded-lg border border-gray-300 px-3 py-2"
              placeholder="Price"
              type="number"
              min="0"
              step="0.01"
              value={sessionForm.price}
              onChange={(event) => setSessionForm((prev) => ({ ...prev, price: event.target.value }))}
              required
            />
            <textarea
              className="rounded-lg border border-gray-300 px-3 py-2 md:col-span-2"
              placeholder="Description"
              value={sessionForm.description}
              onChange={(event) => setSessionForm((prev) => ({ ...prev, description: event.target.value }))}
              required
            />
            <input
              className="rounded-lg border border-gray-300 px-3 py-2"
              type="datetime-local"
              value={sessionForm.start_time}
              onChange={(event) => setSessionForm((prev) => ({ ...prev, start_time: event.target.value }))}
              required
            />
            <input
              className="rounded-lg border border-gray-300 px-3 py-2"
              type="datetime-local"
              value={sessionForm.end_time}
              onChange={(event) => setSessionForm((prev) => ({ ...prev, end_time: event.target.value }))}
              required
            />
            <button
              type="submit"
              disabled={createSessionMutation.isPending || updateSessionMutation.isPending}
              className="rounded-lg bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300 md:col-span-2"
            >
              {editingSessionId
                ? updateSessionMutation.isPending
                  ? 'Updating...'
                  : 'Update Session'
                : createSessionMutation.isPending
                ? 'Creating...'
                : 'Create Session'}
            </button>

            {editingSessionId && (
              <button
                type="button"
                onClick={cancelEditingSession}
                className="rounded-lg border border-gray-300 bg-white px-5 py-2 font-medium text-gray-700 hover:bg-gray-50 md:col-span-2"
              >
                Cancel Edit
              </button>
            )}
          </form>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
          <h3 className="mb-4 text-xl font-semibold">Your Sessions</h3>
          {creatorSessionsQuery.isLoading ? (
            <p className="animate-pulse text-gray-500">Loading your sessions...</p>
          ) : sessions.length === 0 ? (
            <p className="text-gray-500">No sessions yet. Create your first one above.</p>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                  <div>
                    <h4 className="font-semibold text-gray-800">{session.title}</h4>
                    <p className="text-sm text-gray-500">${session.price} • {new Date(session.start_time).toLocaleString()}</p>
                    <span
                      className={`mt-2 inline-block rounded-full px-2 py-1 text-xs font-medium ${
                        session.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {session.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => startEditingSession(session)}
                      className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700 hover:bg-blue-100"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        toggleSessionActiveMutation.mutate({
                          sessionId: session.id,
                          nextIsActive: !session.is_active,
                        })
                      }
                      className="rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      disabled={toggleSessionActiveMutation.isPending}
                    >
                      {session.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteSessionMutation.mutate(session.id)}
                      className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 hover:bg-red-100"
                      disabled={deleteSessionMutation.isPending}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
          <h3 className="mb-4 text-xl font-semibold">Booking Overview</h3>
          {creatorBookingsOverviewQuery.isLoading ? (
            <p className="animate-pulse text-gray-500">Loading booking overview...</p>
          ) : (creatorBookingsOverviewQuery.data || []).length === 0 ? (
            <p className="text-gray-500">No bookings on your sessions yet.</p>
          ) : (
            <div className="space-y-2">
              {(creatorBookingsOverviewQuery.data || []).map((booking) => (
                <div key={booking.id} className="rounded-lg border border-purple-100 bg-purple-50 p-3 text-purple-900">
                  <p className="font-medium">{booking.session_title}</p>
                  <p className="text-sm text-purple-700">
                    Booked by {booking.user_username} on {new Date(booking.booked_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  const bookings = bookingsQuery.data || [];
  const now = new Date();

  const activeBookings = bookings.filter((booking) => {
    if (!booking.session_end_time) return true;
    const endTime = new Date(booking.session_end_time);
    return !Number.isNaN(endTime.getTime()) && endTime >= now;
  });

  const pastBookings = bookings.filter((booking) => {
    if (!booking.session_end_time) return false;
    const endTime = new Date(booking.session_end_time);
    return !Number.isNaN(endTime.getTime()) && endTime < now;
  });

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
      <h2 className="mb-4 text-2xl font-bold">User Dashboard</h2>
      <p className="mb-6 text-gray-600">
        Hello, <span className="font-semibold text-blue-600">{user?.email}</span>!
      </p>

      <h3 className="mb-3 font-medium text-blue-800">Your Active Bookings</h3>
      {bookingsQuery.isLoading ? (
        <p className="animate-pulse text-gray-500">Loading bookings...</p>
      ) : activeBookings.length === 0 ? (
        <p className="text-gray-500">No active bookings right now.</p>
      ) : (
        <div className="space-y-2">
          {activeBookings.map((booking) => (
            <div key={booking.id} className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-blue-900">
              <p className="font-medium">{booking.session_title}</p>
              <p className="text-sm text-blue-700">
                Ends on {booking.session_end_time ? new Date(booking.session_end_time).toLocaleString() : 'N/A'}
              </p>
            </div>
          ))}
        </div>
      )}

      <h3 className="mb-3 mt-8 font-medium text-gray-700">Past Bookings</h3>
      {bookingsQuery.isLoading ? (
        <p className="animate-pulse text-gray-500">Loading past bookings...</p>
      ) : pastBookings.length === 0 ? (
        <p className="text-gray-500">No past bookings yet.</p>
      ) : (
        <div className="space-y-2">
          {pastBookings.map((booking) => (
            <div key={booking.id} className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-gray-800">
              <p className="font-medium">{booking.session_title}</p>
              <p className="text-sm text-gray-600">
                Ended on {booking.session_end_time ? new Date(booking.session_end_time).toLocaleString() : 'N/A'}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;