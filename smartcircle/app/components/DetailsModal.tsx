'use client';

import { useState } from 'react';
import { Connection } from '../page';

interface DetailsModalProps {
  connection: Connection;
  onClose: () => void;
  onSaveNotes: (connectionId: string, notes: string) => void;
  onResetConnection: (connectionId: string) => void;
}

export default function DetailsModal({
  connection,
  onClose,
  onSaveNotes,
  onResetConnection
}: DetailsModalProps) {
  const [name, setName] = useState(connection.name);
  const [age, setAge] = useState(connection.age.toString());
  const [gender, setGender] = useState<'male' | 'female' | 'other'>(connection.gender);
  const [location, setLocation] = useState(connection.location);
  const [profession, setProfession] = useState(connection.profession);
  const [phoneNumber, setPhoneNumber] = useState(connection.phoneNumber || '');
  const [showSocials, setShowSocials] = useState(false);
  const [instagram, setInstagram] = useState(connection.socials?.instagram || '');
  const [linkedin, setLinkedin] = useState(connection.socials?.linkedin || '');
  const [twitter, setTwitter] = useState(connection.socials?.twitter || '');
  const [facebook, setFacebook] = useState(connection.socials?.facebook || '');
  const [otherSocial, setOtherSocial] = useState(connection.socials?.other || '');
  const [closeness, setCloseness] = useState(connection.closeness);
  const [newNotes, setNewNotes] = useState('');

  const handleSaveNotes = () => {
    if (newNotes.trim()) {
      onSaveNotes(connection.id, newNotes);
      setNewNotes('');
    }
  };

  const daysSinceAdded = Math.floor(
    (new Date().getTime() - new Date(connection.dateAdded).getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
      <div className="bg-gray-50 rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl pointer-events-auto border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Edit Connection</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <form className="space-y-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 text-gray-900 placeholder-gray-500"
          />

          <input
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="Age"
            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 text-gray-900 placeholder-gray-500"
          />

          <select
            value={gender}
            onChange={(e) => setGender(e.target.value as 'male' | 'female' | 'other')}
            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 text-gray-900"
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>

          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Location"
            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 text-gray-900 placeholder-gray-500"
          />

          <input
            type="text"
            value={profession}
            onChange={(e) => setProfession(e.target.value)}
            placeholder="Profession"
            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 text-gray-900 placeholder-gray-500"
          />

          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="Phone Number (optional)"
            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 text-gray-900 placeholder-gray-500"
          />

          {/* Social Links - Expandable */}
          <div className="bg-white border border-gray-300 rounded-lg p-4">
            <button
              type="button"
              onClick={() => setShowSocials(!showSocials)}
              className="flex items-center justify-between w-full text-left font-medium text-gray-900 hover:text-indigo-600"
            >
              <span>Social Links (optional)</span>
              <span className="text-xl">{showSocials ? '−' : '+'}</span>
            </button>

            {showSocials && (
              <div className="mt-4 space-y-3">
                <input
                  type="text"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="Instagram"
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 text-sm text-gray-900 placeholder-gray-500"
                />
                <input
                  type="text"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  placeholder="LinkedIn"
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 text-sm text-gray-900 placeholder-gray-500"
                />
                <input
                  type="text"
                  value={twitter}
                  onChange={(e) => setTwitter(e.target.value)}
                  placeholder="Twitter/X"
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 text-sm text-gray-900 placeholder-gray-500"
                />
                <input
                  type="text"
                  value={facebook}
                  onChange={(e) => setFacebook(e.target.value)}
                  placeholder="Facebook"
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 text-sm text-gray-900 placeholder-gray-500"
                />
                <input
                  type="text"
                  value={otherSocial}
                  onChange={(e) => setOtherSocial(e.target.value)}
                  placeholder="Other"
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 text-sm text-gray-900 placeholder-gray-500"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Notes
            </label>
            <div className="bg-white p-4 rounded-lg border border-gray-300 max-h-32 overflow-y-auto mb-2">
              {connection.notes ? (
                <p className="text-sm whitespace-pre-wrap text-gray-900">{connection.notes}</p>
              ) : (
                <p className="text-sm text-gray-500 italic">No notes yet</p>
              )}
            </div>
            <textarea
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              placeholder="Add new notes..."
              rows={3}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 text-gray-900 placeholder-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Closeness: <span className="text-indigo-600 font-bold">{closeness}</span>
            </label>
            <input
              type="range"
              value={closeness}
              onChange={(e) => setCloseness(parseInt(e.target.value))}
              min="1"
              max="10"
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-600">
              <span>Distant (1)</span>
              <span>Very Close (10)</span>
            </div>
          </div>

          <div className="text-sm text-gray-600">
            Last connected: {daysSinceAdded} days ago
          </div>

          <div className="space-y-2">
            <button
              type="button"
              onClick={handleSaveNotes}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
            >
              Save Changes
            </button>

            <button
              type="button"
              onClick={() => onResetConnection(connection.id)}
              className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition"
            >
              Reset Connection (Just Connected!)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
