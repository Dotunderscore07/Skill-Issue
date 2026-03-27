import React, { useState } from 'react';
import { Pencil, Camera, X, Check } from 'lucide-react';
import { Button } from '../../ui';
import { User } from '../../../modules/shared/types';
import { usePhotoUpload } from '../../../hooks/usePhotoUpload';

interface CoordinatorProfileSectionProps {
  user: User;
  updateUserProfile: (id: string, data: any) => Promise<void>;
}

export const CoordinatorProfileSection: React.FC<CoordinatorProfileSectionProps> = ({ user, updateUserProfile }) => {
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
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg overflow-hidden shrink-0">
            {user.avatar?.startsWith('data:') ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <span>{user.avatar}</span>
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-indigo-600 mb-1">Coordinator Dashboard</p>
            <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
            <p className="text-gray-500 mt-1 text-sm">Overview of teaching staff, enrolled children, parents, and recent announcements.</p>
          </div>
        </div>
        <Button variant="secondary" onClick={() => setEditingProfile(true)}>
          <Pencil size={14} /> Edit Profile
        </Button>
      </div>

      {editingProfile && (
        <div className="mt-5 p-4 bg-indigo-50 rounded-xl border border-indigo-100 space-y-4">
          <h4 className="font-semibold text-gray-800 text-sm">Edit Your Profile</h4>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-indigo-100 overflow-hidden flex items-center justify-center font-bold text-indigo-700 shrink-0">
              {previewPhoto ? <img src={previewPhoto} alt="Preview" className="w-full h-full object-cover" /> : user.avatar}
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
