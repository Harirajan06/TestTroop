import React from 'react';
import { ContestStatus, ReviewStatus } from '../types';

interface StatusBadgeProps {
  status: ContestStatus | ReviewStatus | string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const formatText = (str: string) => {
    return str
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  const getBadgeClass = (s: string) => {
    switch (s) {
      case 'testing_live':
        return 'badge-testing_live';
      case 'registration_open':
        return 'badge-registration_open';
      case 'upcoming':
        return 'badge-upcoming';
      case 'winner_announced':
        return 'badge-winner_announced';
      case 'draft':
        return 'badge-draft';
      case 'shortlisted':
      case 'valid':
        return 'badge-testing_live';
      case 'rejected':
      case 'invalid':
        return 'badge-danger';
      default:
        return 'badge-submission_closed';
    }
  };

  return (
    <span className={`badge ${getBadgeClass(status)}`}>
      <span className="badge-dot" />
      {formatText(status)}
    </span>
  );
};
