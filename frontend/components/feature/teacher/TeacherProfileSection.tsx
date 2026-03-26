import React, { useState } from 'react';
import { Pencil, Camera, X, Check, Plus } from 'lucide-react';
import { Button } from '../../ui';
import { User } from '../../../modules/shared/types';
import { usePhotoUpload } from '../../../hooks/usePhotoUpload';

interface TeacherProfileSectionProps {
  user: User;
  greeting: string;
  availableClasses: { id: string; name: string }[];
  selectedClassId: string;
  onClassChange: (id: string) => void;
  onNavigate: (view: 'announcements' | 'messages') => void;
  updateUserProfile: (id: string, data: any) => Promise<void>;
}

export const TeacherProfileSection: React.FC<TeacherProfileSectionProps> = ({
  user,
  greeting,
  availableClasses,
  selectedClassId,
  onClassChange,
  onNavigate,
  updateUserProfile,
}) => {
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState(user.name);
  const [profilePhone, setProfilePhone] = useState(user.phone ?? '');
  const [profilePhoto, setProfilePhoto] = useState('');
  
  const { fileInputRef: photoRef, handleFileChange, triggerUpload } = usePhotoUpload(setProfilePhoto);

  const handleSaveProfile = async () => {
    const payload: { name: string; phone: string; avatar?: string } = {
      name: profileName,
      phone: profilePhone,
    };
    if (profilePhoto) payload.avatar = profilePhoto;
    await updateUserProfile(user.id, payload);
    setEditingProfile(false);
  };

  const previewPhoto = profilePhoto || (user.avatar?.startsWith('data:') ? user.avatar : '');

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg overflow-hidden shrink-0">
            {user.avatar?.startsWith('data:') ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <span>{user.avatar || user.name.slice(0, 2).toUpperCase()}</span>
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-indigo-600 mb-1">Teacher Dashboard</p>
            <h2 className="text-2xl font-bold text-gray-900">{greeting}, {user.name}!</h2>
            <div className="flex items-center gap-2 text-gray-500 mt-1">
              <span>Here&apos;s what&apos;s happening in</span>
              {availableClasses.length > 0 ? (
                <select
                  className="bg-white border border-gray-200 text-gray-700 px-2 py-1 rounded-md text-sm font-medium focus:outline-none focus:border-indigo-500"
                  value={selectedClassId}
                  onChange={(e) => onClassChange(e.target.value)}
                >
                  {availableClasses.map((entry) => (
                    <option key={entry.id} value={entry.id}>{entry.name}</option>
                  ))}
                </select>
              ) : (
                <span>your classroom</span>
              )}
              <span>today.</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={() => setEditingProfile(true)}>
            <Pencil size={14} /> My Profile
          </Button>
          <Button onClick={() => onNavigate('announcements')}>
            <Plus size={18} /> New Announcement
          </Button>
        </div>
      </div>

      {editingProfile && (
        <div className="mt-5 p-4 bg-indigo-50 rounded-xl border border-indigo-100 space-y-4">
          <h4 className="font-semibold text-gray-800 text-sm">Edit Your Profile</h4>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-indigo-100 overflow-hidden flex items-center justify-center font-bold text-indigo-700 shrink-0">
              {previewPhoto ? <img src={previewPhoto} alt="Preview" className="w-full h-full object-cover" /> : user.avatar || user.name.slice(0, 2).toUpperCase()}
            </div>
            <input type="file" accept="image/*" ref={photoRef} className="hidden" onChange={handleFileChange} />
            <Button variant="secondary" onClick={triggerUpload}><Camera size={14} /> Upload Photo</Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input value={profileName} onChange={(e) => setProfileName(e.target.value)} placeholder="Full Name" className="w-full px-3 py-2 text-sm border rounded-lg" />
            <input value={profilePhone} onChange={(e) => setProfilePhone(e.target.value)} placeholder="Phone" className="w-full px-3 py-2 text-sm border rounded-lg" />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setEditingProfile(false)}><X size={14} /> Cancel</Button>
            <Button onClick={handleSaveProfile}><Check size={14} /> Save</Button>
          </div>
        </div>
      )}
    </div>
  );
};
