'use client';

import { useState } from 'react';
import { Connection } from '../page';

interface ConnectionModalProps {
  onClose: () => void;
  onSave: (connection: Omit<Connection, 'id' | 'dateAdded'>) => void;
}

export default function ConnectionModal({ onClose, onSave }: ConnectionModalProps) {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('other');
  const [location, setLocation] = useState('');
  const [profession, setProfession] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showSocials, setShowSocials] = useState(false);
  const [instagram, setInstagram] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [twitter, setTwitter] = useState('');
  const [facebook, setFacebook] = useState('');
  const [otherSocial, setOtherSocial] = useState('');
  const [closeness, setCloseness] = useState(5);
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      age: parseInt(age),
      gender,
      location,
      profession,
      email: email || undefined,
      phoneNumber: phoneNumber || undefined,
      socials: {
        instagram: instagram || undefined,
        linkedin: linkedin || undefined,
        twitter: twitter || undefined,
        facebook: facebook || undefined,
        other: otherSocial || undefined,
      },
      closeness,
      notes
    });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
      <div className="bg-gray-50 rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl pointer-events-auto border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Add New Connection</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            required
            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 text-gray-900 placeholder-gray-500"
          />

          <input
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="Age"
            required
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
            required
            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 text-gray-900 placeholder-gray-500"
          />

          <input
            type="text"
            value={profession}
            onChange={(e) => setProfession(e.target.value)}
            placeholder="Profession"
            required
            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 text-gray-900 placeholder-gray-500"
          />

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email (optional)"
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

          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes about this person..."
            rows={3}
            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 text-gray-900 placeholder-gray-500"
          />

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

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
          >
            Save Connection
          </button>
        </form>
      </div>
    </div>
  );
}
