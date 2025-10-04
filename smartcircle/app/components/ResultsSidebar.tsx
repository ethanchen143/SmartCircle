'use client';

import { SearchResults, SearchCandidate } from '../types/searchResults';
import { Connection } from '../page';
import { X } from 'lucide-react';

interface ResultsSidebarProps {
  results: SearchResults | null;
  connections: Connection[];
  onClose: () => void;
  onCandidateClick: (candidateId: string) => void;
}

export default function ResultsSidebar({ results, connections, onClose, onCandidateClick }: ResultsSidebarProps) {
  if (!results) return null;

  return (
    <div className="fixed left-0 top-0 h-screen w-96 bg-white shadow-2xl z-50 overflow-y-auto border-r border-gray-200">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 p-4 z-10">
        <div className="flex items-start justify-between mb-2">
          <h2 className="text-lg font-semibold text-gray-900 flex-1 pr-2">
            {results.task}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition flex-shrink-0"
          >
            <X size={20} />
          </button>
        </div>
        <p className="text-sm text-gray-500">
          {results.candidates.length} {results.candidates.length === 1 ? 'candidate' : 'candidates'} found
        </p>
      </div>

      {/* Candidates List */}
      <div className="p-4 space-y-4">
        {results.candidates.map((candidate, index) => {
          const connection = connections.find(c => c.id === candidate.connection_id);
          if (!connection) return null;

          return (
            <CandidateCard
              key={candidate.connection_id}
              candidate={candidate}
              connection={connection}
              rank={index + 1}
              onClick={() => onCandidateClick(candidate.connection_id)}
            />
          );
        })}
      </div>
    </div>
  );
}

interface CandidateCardProps {
  candidate: SearchCandidate;
  connection: Connection;
  rank: number;
  onClick: () => void;
}

function CandidateCard({ candidate, connection, rank, onClick }: CandidateCardProps) {
  const { reasoning, outreachMessage } = candidate;

  return (
    <div
      onClick={onClick}
      className="border border-gray-200 rounded-lg p-4 hover:border-indigo-400 hover:shadow-md transition cursor-pointer bg-white"
    >
      {/* Rank and Name */}
      <div className="flex items-start gap-3 mb-3">
        <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-semibold text-sm">
          {rank}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-base">{connection.name}</h3>
          <p className="text-sm text-gray-600">{connection.profession}</p>
          <p className="text-xs text-gray-500">{connection.location}</p>
        </div>
      </div>

      {/* Reasoning */}
      <div className="mb-3">
        <h4 className="text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">Why this person?</h4>
        <p className="text-sm text-gray-700 leading-relaxed">{reasoning}</p>
      </div>

      {/* Outreach Message */}
      <div className="mb-3">
        <h4 className="text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">Suggested Message</h4>
        <div className="bg-gray-50 rounded p-3 border border-gray-200">
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{outreachMessage}</p>
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          // Handle reach out action
          if (connection.phoneNumber) {
            window.open(`sms:${connection.phoneNumber}&body=${encodeURIComponent(outreachMessage)}`);
          } else if (connection.socials?.linkedin) {
            window.open(connection.socials.linkedin, '_blank');
          }
        }}
        className="w-full bg-indigo-600 text-white text-sm font-medium py-2 px-4 rounded-lg hover:bg-indigo-700 transition"
      >
        Reach Out
      </button>
    </div>
  );
}
