import React, { useState } from 'react';
import { Pencil, Camera, X, Check } from 'lucide-react';
import { Button } from '../../ui';
import { User, Student } from '../../../modules/shared/types';
import { usePhotoUpload } from '../../../hooks/usePhotoUpload';

interface ProfileSectionProps {
  user: User;
  selectedChild: Student;
  getGreeting: () => string;
  updateUserProfile: (id: string, data: any) => Promise<void>;
  updateStudent: (id: string, data: any) => Promise<void>;
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({
  user,
  selectedChild,
  getGreeting,
  updateUserProfile,
  updateStudent,
}) => {
  const [editingProfile, setEditingProfile] = useState(false);
  const [editingChild, setEditingChild] = useState(false);

  // Parent profile edit state
  const [profileName, setProfileName] = useState(user.name);
  const [profilePhone, setProfilePhone] = useState(user.phone ?? '');
  const [profilePhoto, setProfilePhoto] = useState('');
  
  const { fileInputRef: parentPhotoRef, handleFileChange: handleParentPhotoChange, triggerUpload: triggerParentUpload } = usePhotoUpload(setProfilePhoto);

  // Child profile edit state
  const [childName, setChildName] = useState('');
  const [childPhoto, setChildPhoto] = useState('');
  const { fileInputRef: childPhotoRef, handleFileChange: handleChildPhotoChange, triggerUpload: triggerChildUpload } = usePhotoUpload(setChildPhoto);

  const handleSaveProfile = async () => {
    const payload: { name: string; phone: string; avatar?: string } = {
      name: profileName,
      phone: profilePhone,
    };
    if (profilePhoto) payload.avatar = profilePhoto;
    await updateUserProfile(user.id, payload);
    setEditingProfile(false);
  };

  const handleSaveChild = async () => {
    if (!selectedChild) return;
    await updateStudent(selectedChild.id, {
      name: childName,
      dob: selectedChild.dob,
      photo: childPhoto || selectedChild.photo,
      parentId: selectedChild.parentId,
      classId: selectedChild.classId,
    });
    setEditingChild(false);
  };

  const currentAvatar = user.avatar;
  const parentAvatarPreview = profilePhoto || (currentAvatar?.startsWith('data:') ? currentAvatar : '');

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-xl shadow-inner font-bold text-blue-700 overflow-hidden shrink-0">
            {selectedChild.photo ? (
              <img src={selectedChild.photo} alt={selectedChild.name} className="w-full h-full object-cover" />
            ) : (
              selectedChild.name.slice(0, 2).toUpperCase()
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-indigo-600 mb-1">{getGreeting()}, {user.name}!</p>
            <h2 className="text-2xl font-bold text-gray-900">{selectedChild.name}&apos;s Dashboard</h2>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="secondary"
            onClick={() => {
              setProfileName(user.name);
              setProfilePhone(user.phone ?? '');
              setProfilePhoto('');
              setEditingProfile(true);
              setEditingChild(false);
            }}
          >
            <Pencil size={14} /> My Profile
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              setChildName(selectedChild.name);
              setChildPhoto(selectedChild.photo ?? '');
              setEditingChild(true);
              setEditingProfile(false);
            }}
          >
            <Pencil size={14} /> Child Profile
          </Button>
        </div>
      </div>

      {editingProfile && (
        <div className="mt-5 p-4 bg-indigo-50 rounded-xl border border-indigo-100 space-y-4">
          <h4 className="font-semibold text-gray-800 text-sm">Edit Your Profile</h4>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-indigo-100 overflow-hidden flex items-center justify-center font-bold text-indigo-700 shrink-0">
              {parentAvatarPreview ? (
                <img src={parentAvatarPreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <span>{currentAvatar?.startsWith('data:') ? '' : currentAvatar}</span>
              )}
            </div>
            <div>
              <input type="file" accept="image/*" ref={parentPhotoRef} className="hidden" onChange={handleParentPhotoChange} />
              <Button variant="secondary" onClick={triggerParentUpload}><Camera size={14} /> Upload Photo</Button>
            </div>
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

      {editingChild && (
        <div className="mt-5 p-4 bg-blue-50 rounded-xl border border-blue-100 space-y-4">
          <h4 className="font-semibold text-gray-800 text-sm">Edit {selectedChild.name}&apos;s Profile</h4>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-blue-100 overflow-hidden flex items-center justify-center font-bold text-blue-700 shrink-0">
              {childPhoto ? <img src={childPhoto} alt="Preview" className="w-full h-full object-cover" /> : selectedChild.name.slice(0, 2).toUpperCase()}
            </div>
            <input type="file" accept="image/*" ref={childPhotoRef} className="hidden" onChange={handleChildPhotoChange} />
            <Button variant="secondary" onClick={triggerChildUpload}><Camera size={14} /> Upload Photo</Button>
          </div>
          <input value={childName} onChange={(e) => setChildName(e.target.value)} placeholder="Child's Name" className="w-full px-3 py-2 text-sm border rounded-lg" />
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setEditingChild(false)}><X size={14} /> Cancel</Button>
            <Button onClick={handleSaveChild}><Check size={14} /> Save</Button>
          </div>
        </div>
      )}
    </div>
  );
};
