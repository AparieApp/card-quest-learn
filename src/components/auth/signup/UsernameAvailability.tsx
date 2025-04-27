
import React from 'react';

interface UsernameAvailabilityProps {
  status: 'checking' | 'available' | 'taken' | null;
  username: string;
}

export const UsernameAvailability: React.FC<UsernameAvailabilityProps> = ({ status, username }) => {
  if (!status || username.length < 3) {
    return null;
  }

  const statusConfig = {
    checking: {
      text: 'Checking...',
      color: 'text-orange-500'
    },
    available: {
      text: 'Available',
      color: 'text-green-500'
    },
    taken: {
      text: 'Taken',
      color: 'text-red-500'
    }
  };

  const config = statusConfig[status];

  return (
    <div className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium ${config.color} bg-white/80 px-2 py-1 rounded-full`}>
      {config.text}
    </div>
  );
};
