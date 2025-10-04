'use client';

import { useState } from 'react';
import { SearchResults, SearchCandidate } from '../types/searchResults';
import { Connection } from '../page';
import { X } from 'lucide-react';

interface ResultsSidebarProps {
  results: SearchResults | null;
  connections: Connection[];
  onClose: () => void;
  onCandidateClick: (candidateId: string) => void;
  onMarkConnected: (connectionId: string) => void;
}

export default function ResultsSidebar({ results, connections, onClose, onCandidateClick, onMarkConnected }: ResultsSidebarProps) {
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
              onMarkConnected={onMarkConnected}
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
  onMarkConnected: (connectionId: string) => void;
}

function CandidateCard({ candidate, connection, rank, onClick, onMarkConnected }: CandidateCardProps) {
  const { reasoning, outreachMessage } = candidate;
  const [isConnected, setIsConnected] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(outreachMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

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
        <div className="flex items-center justify-between mb-1">
          <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Suggested Message</h4>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCopy();
            }}
            className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1 transition"
          >
            {copied ? (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                Copy
              </>
            )}
          </button>
        </div>
        <div className="bg-gray-50 rounded p-3 border border-gray-200">
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{outreachMessage}</p>
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (!isConnected) {
            onMarkConnected(connection.id);
            setIsConnected(true);
          }
        }}
        className={`w-full text-white text-sm font-medium py-2 px-4 rounded-lg transition ${
          isConnected
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-green-600 hover:bg-green-700'
        }`}
        disabled={isConnected}
      >
        {isConnected ? 'Connected ✓' : 'Mark as Connected'}
      </button>
    </div>
  );
}
