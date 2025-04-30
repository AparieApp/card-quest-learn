
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Bell } from 'lucide-react';

interface FollowBadgeProps {
  isFollowing: boolean;
}

export const FollowBadge: React.FC<FollowBadgeProps> = ({ isFollowing }) => {
  if (!isFollowing) return null;
  
  return (
    <Badge variant="outline" className="ml-2 border-flashcard-primary text-flashcard-primary">
      <Bell className="h-3 w-3 mr-1" />
      Following
    </Badge>
  );
};
