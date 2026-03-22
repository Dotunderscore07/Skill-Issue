'use client';

import React, { useState, useRef } from 'react';
import { Bell, Clock3, Pencil, X, Check, Camera } from 'lucide-react';
import { Card, Badge, Button } from '../ui';
import { User, Announcement } from '../../modules/shared/types';
import { useAppContext } from '../../modules/shared/context/AppContext';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
};

const getDayOfWeek = (dateStr: string) =>
  ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][new Date(`${dateStr}T00:00:00`).getDay()] as string;

interface ParentDashboardProps {
  user: User;
  announcements: Announcement[];
}

export function ParentDashboard({ user, announcements }: ParentDashboardProps) {
  const {
    students,
    selectedChild,
    setSelectedChild,
    routines,
    classes,
    selectedDate,
    authLoading: loading,
    updateUserProfile,
    updateStudent,
  } = useAppContext();

  const [editingProfile, setEditingProfile] = useState(false);
  const [editingChild, setEditingChild] = useState(false);

  // Parent profile edit state
  const [profileName, setProfileName] = useState(user.name);
  const [profilePhone, setProfilePhone] = useState(user.phone ?? '');
  const [profilePhoto, setProfilePhoto] = useState(user.avatar ?? '');
  const parentPhotoRef = useRef<HTMLInputElement>(null);

  // Child profile edit state
  const [childName, setChildName] = useState('');
  const [childPhoto, setChildPhoto] = useState('');
  const childPhotoRef = useRef<HTMLInputElement>(null);

  const myChildren = students.filter((student) => student.parentId === user.id);
  const today = getDayOfWeek(selectedDate);
  const formattedDate = new Date(`${selectedDate}T00:00:00`).toLocaleDateString('en-US', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  const formatTime = (value: string) =>
    new Date(`2000-01-01T${value}:00`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const readFile = (file: File): Promise<string> =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
      reader.readAsDataURL(file);
    });

  const handleParentPhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await readFile(file);
    setProfilePhoto(dataUrl);
  };

  const handleChildPhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await readFile(file);
    setChildPhoto(dataUrl);
  };

  const handleSaveProfile = async () => {
    await updateUserProfile(user.id, { name: profileName, phone: profilePhone });
    setEditingProfile(false);
  };

  const handleSaveChild = async () => {
    if (!selectedChild) return;
    await updateStudent(selectedChild.id, {
      name: childName,
      dob: selectedChild.dob,
      photo: childPhoto,
      parentId: selectedChild.parentId,
      classId: selectedChild.classId,
    });
    setEditingChild(false);
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading your dashboard...</div>;

  if (myChildren.length === 0 || !selectedChild) {
    return (
      <div className="p-8 text-center text-gray-500 bg-white rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold mb-2 text-gray-800">Hang tight!</h2>
        <p>Your account is not linked to a student yet. Please ask the teacher or coordinator to assign your child.</p>
      </div>
    );
  }

  const childClass = classes.find((c) => c.id === selectedChild.classId);
  const todaysRoutines = routines
    .filter((routine) => routine.classId === selectedChild.classId && routine.dayOfWeek === today)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const visibleAnnouncements = announcements
    .filter((a) => !a.classId || a.classId === selectedChild.classId)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Child switcher */}
      {myChildren.length > 1 && (
        <div className="flex bg-white rounded-lg p-1 w-full max-w-sm border shadow-sm overflow-x-auto no-scrollbar">
          <div className="flex flex-nowrap min-w-full gap-1">
            {myChildren.map((child) => (
              <button
                key={child.id}
                onClick={() => setSelectedChild(child)}
                className={`flex-1 whitespace-nowrap py-1.5 px-4 text-sm font-medium rounded-md transition-all ${
                  selectedChild.id === child.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {child.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Header Card */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            {/* Child avatar */}
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-xl shadow-inner font-bold text-blue-700 overflow-hidden">
              {selectedChild.photo ? (
                <img src={selectedChild.photo} alt={selectedChild.name} className="w-full h-full object-cover" />
              ) : (
                selectedChild.name.slice(0, 2).toUpperCase()
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-indigo-600 mb-1">{getGreeting()}, {user.name}!</p>
              <h2 className="text-2xl font-bold text-gray-900">{selectedChild.name}&apos;s Dashboard</h2>
              {childClass && <p className="text-sm text-gray-500 mt-0.5">{childClass.name}</p>}
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

        {/* Inline: Edit Parent Profile */}
        {editingProfile && (
          <div className="mt-5 p-4 bg-indigo-50 rounded-xl border border-indigo-100 space-y-4">
            <h4 className="font-semibold text-gray-800 text-sm">Edit Your Profile</h4>

            {/* Profile photo upload */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-indigo-100 overflow-hidden flex items-center justify-center font-bold text-indigo-700 shrink-0">
                {profilePhoto ? (
                  <img src={profilePhoto} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  user.avatar ?? user.name.slice(0, 2).toUpperCase()
                )}
              </div>
              <div>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  ref={parentPhotoRef}
                  className="hidden"
                  onChange={handleParentPhotoChange}
                />
                <Button variant="secondary" onClick={() => parentPhotoRef.current?.click()}>
                  <Camera size={14} /> Upload Photo
                </Button>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG, WebP supported</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Full Name</label>
                <input
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Phone</label>
                <input
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setEditingProfile(false)}><X size={14} /> Cancel</Button>
              <Button onClick={handleSaveProfile}><Check size={14} /> Save</Button>
            </div>
          </div>
        )}

        {/* Inline: Edit Child Profile */}
        {editingChild && (
          <div className="mt-5 p-4 bg-blue-50 rounded-xl border border-blue-100 space-y-4">
            <h4 className="font-semibold text-gray-800 text-sm">Edit {selectedChild.name}&apos;s Profile</h4>

            {/* Child photo upload */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-blue-100 overflow-hidden flex items-center justify-center font-bold text-blue-700 shrink-0">
                {childPhoto ? (
                  <img src={childPhoto} alt="Preview" className="w-full h-full object-cover" />
                ) : childName.length >= 2 ? (
                  childName.slice(0, 2).toUpperCase()
                ) : '👶'}
              </div>
              <div>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  ref={childPhotoRef}
                  className="hidden"
                  onChange={handleChildPhotoChange}
                />
                <Button variant="secondary" onClick={() => childPhotoRef.current?.click()}>
                  <Camera size={14} /> Upload Photo
                </Button>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG, WebP supported</p>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Child&apos;s Name</label>
              <input
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setEditingChild(false)}><X size={14} /> Cancel</Button>
              <Button onClick={handleSaveChild}><Check size={14} /> Save</Button>
            </div>
          </div>
        )}
      </div>

      {/* Main widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Routine */}
        <Card className="flex flex-col">
          <div className="p-4 border-b border-gray-100 flex items-center gap-2">
            <Clock3 size={18} className="text-sky-600" />
            <h3 className="font-bold text-lg">
              Today&apos;s Routine{' '}
              <span className="text-gray-500 text-sm font-normal ml-2">{formattedDate}</span>
            </h3>
          </div>
          <div className="p-4 space-y-3 flex-1">
            {todaysRoutines.length > 0 ? (
              todaysRoutines.map((routine) => (
                <div key={routine.id} className="flex items-center gap-3 p-3 rounded-lg bg-sky-50 border border-sky-100">
                  <div className="text-xs font-bold text-sky-600 w-20 shrink-0">
                    {formatTime(routine.startTime)}
                    <br />
                    <span className="text-sky-400">{formatTime(routine.endTime)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900 truncate">{routine.title}</p>
                    <p className="text-xs text-gray-400">{routine.teacherName}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex-1 flex items-center justify-center py-8 text-center text-gray-400 italic">
                No routines scheduled for today.
              </div>
            )}
          </div>
        </Card>

        {/* Notice Board */}
        <Card className="flex flex-col">
          <div className="p-4 border-b border-gray-100 flex items-center gap-2">
            <Bell size={18} className="text-yellow-600" />
            <h3 className="font-bold text-lg">Notice Board</h3>
          </div>
          <div className="p-4 space-y-3 flex-1">
            {visibleAnnouncements.length > 0 ? (
              visibleAnnouncements.map((announcement) => (
                <div key={announcement.id} className="p-3 rounded-lg border border-gray-100 bg-gray-50 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge color={announcement.type === 'urgent' ? 'red' : announcement.type === 'event' ? 'green' : 'blue'}>
                      {announcement.type.toUpperCase()}
                    </Badge>
                    <span className="text-xs text-gray-500 font-medium">{announcement.author}</span>
                    <span className="text-xs text-gray-400">{announcement.className ?? 'All Classes'}</span>
                  </div>
                  <p className="text-sm text-gray-800">{announcement.text}</p>
                  <p className="text-xs text-gray-400">{announcement.date}</p>
                </div>
              ))
            ) : (
              <div className="flex-1 flex items-center justify-center py-8 text-center text-gray-400 italic">
                No announcements yet.
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
