
import React, { useEffect, useState } from 'react';
import { getUsernameById } from '@/utils/userUtils';
import { User } from 'lucide-react';

interface DeckOwnerProps {
  creatorId: string;
  className?: string;
}

const DeckOwner: React.FC<DeckOwnerProps> = ({ creatorId, className = '' }) => {
  const [creatorUsername, setCreatorUsername] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCreatorUsername = async () => {
      if (creatorId) {
        try {
          setIsLoading(true);
          const username = await getUsernameById(creatorId);
          setCreatorUsername(username);
        } catch (error) {
          console.error('Error fetching creator username:', error);
          setCreatorUsername('Unknown');
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchCreatorUsername();
  }, [creatorId]);

  return (
    <div className={`flex items-center gap-1 text-xs text-muted-foreground ${className}`}>
      <User className="h-3 w-3" />
      {isLoading ? (
        <span className="animate-pulse">Loading...</span>
      ) : (
        <span>{creatorUsername}</span>
      )}
    </div>
  );
};

export default DeckOwner;
