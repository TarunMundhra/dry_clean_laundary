import { useSessions } from '../hooks/useSessions';
import { useBookings } from '../hooks/useBookings';
import { SessionCard } from '../components/SessionCard';

const Marketplace = ({ user }) => {
  const { data: sessions, isLoading, error } = useSessions();
  const { mutate: bookSession, status: bookingStatus, error: bookingError } = useBookings();
  const sessionList = Array.isArray(sessions) ? sessions : [];

  if (isLoading) return <div className="animate-pulse">Loading Marketplace...</div>;

  return (
    <div>
      {(error || bookingError) && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg border border-red-200">
          {error?.message || bookingError?.response?.data?.detail || bookingError?.message || 'Failed to load marketplace.'}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sessionList.map((session) => (
          <SessionCard
            key={session.id}
            session={session}
            user={user}
            onBook={() => bookSession(session.id)}
            isBooking={bookingStatus === 'pending'}
          />
        ))}
      </div>
    </div>
  );
};

export default Marketplace; 