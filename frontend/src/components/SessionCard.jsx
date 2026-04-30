import { Link } from 'react-router-dom';

export const SessionCard = ({ session, user, onBook, status, isBooking = false }) => {
  const bookingInProgress = status === 'loading' || isBooking;
  const bookingComplete = status === 'success';

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition flex flex-col justify-between">
      <div>
        <h3 className="text-lg font-bold mb-2">{session.title}</h3>
        <p className="text-gray-600 mb-4 line-clamp-2">{session.description}</p>
      </div>
      
      <div>
        <div className="flex justify-between items-center text-sm mb-4">
          <span className="font-medium text-gray-500">Host: {session.creator_username}</span>
          <span className="font-bold text-green-600 text-lg">${session.price}</span>
        </div>

        <Link
          to={`/sessions/${session.id}`}
          className="mb-3 inline-block text-sm font-medium text-blue-600 hover:underline"
        >
          View Details
        </Link>

        {/* Dynamic Booking Button */}
        {user ? (
          <button 
            onClick={onBook}
            disabled={bookingInProgress || bookingComplete}
            className={`w-full py-2 rounded-lg font-medium transition ${
              bookingComplete
                ? 'bg-green-100 text-green-700 cursor-default'
                : bookingInProgress
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {bookingComplete ? '✓ Booked!' : bookingInProgress ? 'Booking...' : 'Book Session'}
          </button>
        ) : (
          <div className="text-center text-sm text-gray-400 bg-gray-50 py-2 rounded-lg">
            Log in to book
          </div>
        )}
      </div>
    </div>
  );
};