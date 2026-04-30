import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { useBookings } from '../hooks/useBookings';
import { axiosInstance } from '../api/axios';

const SessionDetail = ({ user }) => {
  const { sessionId } = useParams();
  const { mutate: bookSession, status: bookingStatus, error: bookingError, isSuccess } = useBookings();

  const sessionQuery = useQuery({
    queryKey: ['session', sessionId],
    queryFn: async () => {
      const response = await axiosInstance.get(`marketplace/sessions/${sessionId}/`);
      return response.data;
    },
    enabled: Boolean(sessionId),
  });

  if (sessionQuery.isLoading) {
    return <div className="animate-pulse text-gray-500">Loading session details...</div>;
  }

  if (sessionQuery.error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
        {sessionQuery.error?.response?.data?.detail || sessionQuery.error?.message || 'Failed to load session details.'}
      </div>
    );
  }

  const session = sessionQuery.data;
  const canBook = user && user.role === 'user';

  return (
    <div className="space-y-4 rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
      <Link to="/" className="inline-block text-sm font-medium text-blue-600 hover:underline">
        ← Back to Marketplace
      </Link>

      <h2 className="text-2xl font-bold text-gray-900">{session.title}</h2>
      <p className="text-gray-700">{session.description}</p>

      <div className="grid gap-3 rounded-lg border border-gray-100 bg-gray-50 p-4 text-sm text-gray-700 md:grid-cols-2">
        <p>
          <span className="font-medium text-gray-900">Host:</span> {session.creator_username}
        </p>
        <p>
          <span className="font-medium text-gray-900">Price:</span> ${session.price}
        </p>
        <p>
          <span className="font-medium text-gray-900">Starts:</span> {new Date(session.start_time).toLocaleString()}
        </p>
        <p>
          <span className="font-medium text-gray-900">Ends:</span> {new Date(session.end_time).toLocaleString()}
        </p>
      </div>

      {bookingError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {bookingError?.response?.data?.detail || bookingError?.message || 'Booking failed.'}
        </div>
      )}

      {isSuccess && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          Booking successful.
        </div>
      )}

      {user ? (
        canBook ? (
          <button
            type="button"
            onClick={() => bookSession(session.id)}
            disabled={bookingStatus === 'pending' || isSuccess}
            className="rounded-lg bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {isSuccess ? 'Booked' : bookingStatus === 'pending' ? 'Booking...' : 'Book Now'}
          </button>
        ) : (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            Only users can book sessions. Creator accounts can manage sessions from dashboard.
          </div>
        )
      ) : (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-600">
          Log in with a user account to book this session.
        </div>
      )}
    </div>
  );
};

export default SessionDetail;
