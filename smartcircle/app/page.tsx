'use client';

import { useState } from 'react';
import NetworkGraph from './components/NetworkGraph';
import ConnectionModal from './components/ConnectionModal';
import DetailsModal from './components/DetailsModal';
import ResultsSidebar from './components/ResultsSidebar';
import { mockConnections } from './data/mockConnections';
import { generateMockSearchResults } from './data/mockSearchResults';
import { SearchResults } from './types/searchResults';

export interface Connection {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  location: string;
  profession: string;
  phoneNumber?: string;
  socials?: {
    instagram?: string;
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    other?: string;
  };
  closeness: number;
  notes: string;
  dateAdded: Date;
}

export default function Home() {
  const [question, setQuestion] = useState('');
  const [connections, setConnections] = useState<Connection[]>(
    mockConnections.map((conn, index) => ({
      ...conn,
      id: (index + 1).toString(),
    }))
  );

  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedConnection, setSelectedConnection] = useState<Connection | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null);
  const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null);

  const handleAsk = () => {
    if (!question.trim()) return;

    console.log('User question:', question);

    // Simulate AI processing delay
    setTimeout(() => {
      const results = generateMockSearchResults(question);
      setSearchResults(results);
    }, 500);
  };

  const handleCloseSidebar = () => {
    setSearchResults(null);
    setFocusedNodeId(null);
  };

  const handleCandidateClick = (candidateId: string) => {
    setFocusedNodeId(candidateId);
  };

  const handleAddConnection = (connection: Omit<Connection, 'id' | 'dateAdded'>) => {
    const newConnection: Connection = {
      ...connection,
      id: Date.now().toString(),
      dateAdded: new Date()
    };
    setConnections([...connections, newConnection]);
    setShowConnectionModal(false);
  };

  const handleConnectionClick = (connection: Connection) => {
    setSelectedConnection(connection);
    setShowDetailsModal(true);
  };

  const handleSaveNotes = (connectionId: string, newNotes: string) => {
    setConnections(connections.map(conn =>
      conn.id === connectionId ? { ...conn, notes: conn.notes + '\n' + newNotes } : conn
    ));
  };

  const handleResetConnection = (connectionId: string) => {
    setConnections(connections.map(conn =>
      conn.id === connectionId ? { ...conn, dateAdded: new Date(), closeness: Math.min(10, conn.closeness + 1) } : conn
    ));
    setShowDetailsModal(false);
  };

  return (
    <main className="h-screen w-screen overflow-hidden bg-white">
      {/* Results Sidebar */}
      <ResultsSidebar
        results={searchResults}
        connections={connections}
        onClose={handleCloseSidebar}
        onCandidateClick={handleCandidateClick}
      />

      {/* Network Graph - Full Page */}
      <NetworkGraph
        connections={connections}
        onConnectionClick={handleConnectionClick}
        focusedNodeId={focusedNodeId}
      />

      {/* Floating Ask Bar */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 w-full max-w-2xl px-4 z-40">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 flex gap-2 p-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="What do you want to do today?"
            className="flex-1 px-4 py-2 text-base rounded-lg focus:outline-none text-gray-800 placeholder-gray-400"
            onKeyPress={(e) => e.key === 'Enter' && handleAsk()}
          />
          <button
            onClick={handleAsk}
            className="px-6 py-2 bg-indigo-600 text-white text-base font-medium rounded-lg hover:bg-indigo-700 transition"
          >
            Connect
          </button>
        </div>
      </div>

      {/* Floating Add Button */}
      <button
        onClick={() => setShowConnectionModal(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 text-white text-3xl rounded-full shadow-lg hover:bg-indigo-700 transition transform hover:scale-105 z-40 flex items-center justify-center"
      >
        +
      </button>

      {/* Modals */}
      {showConnectionModal && (
        <ConnectionModal
          onClose={() => setShowConnectionModal(false)}
          onSave={handleAddConnection}
        />
      )}

      {showDetailsModal && selectedConnection && (
        <DetailsModal
          connection={selectedConnection}
          onClose={() => setShowDetailsModal(false)}
          onSaveNotes={handleSaveNotes}
          onResetConnection={handleResetConnection}
        />
      )}
    </main>
  );
}
