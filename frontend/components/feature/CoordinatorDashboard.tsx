'use client';

import React, { useState, useRef } from 'react';
import { Clock3, Megaphone, Shapes, Users, UserSquare2, Pencil, Camera, X, Check } from 'lucide-react';
import { Card, Badge, Button } from '../ui';
import { Announcement, User } from '../../modules/shared/types';
import { useAppContext } from '../../modules/shared/context/AppContext';

const getDayOfWeek = (date: string) =>
  new Date(`${date}T00:00:00`).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() as
    | 'sunday'
    | 'monday'
    | 'tuesday'
    | 'wednesday'
    | 'thursday'
    | 'friday'
    | 'saturday';

interface CoordinatorDashboardProps {
  user: User;
}

export function CoordinatorDashboard({ user }: CoordinatorDashboardProps) {
  const { coordinatorSummary, routines, classes: allClasses, allUsers, selectedClass, setSelectedClass, selectedDate, updateUserProfile } = useAppContext();

  const [editingProfile, setEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState(user.name);
  const [profilePhone, setProfilePhone] = useState(user.phone ?? '');
  const [profilePhoto, setProfilePhoto] = useState<string>('');
  const photoRef = useRef<HTMLInputElement>(null);

  const readFile = (file: File): Promise<string> =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
      reader.readAsDataURL(file);
    });

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await readFile(file);
    setProfilePhoto(dataUrl);
  };

  const handleSaveProfile = async () => {
    const payload: { name: string; phone: string; avatar?: string } = {
      name: profileName,
      phone: profilePhone,
    };
    if (profilePhoto) payload.avatar = profilePhoto;
    await updateUserProfile(user.id, payload);
    setEditingProfile(false);
  };

  const openEdit = () => {
    setProfileName(user.name);
    setProfilePhone(user.phone ?? '');
    setProfilePhoto('');
    setEditingProfile(true);
  };

  React.useEffect(() => {
    if (allClasses.length === 0) {
      return;
    }

    if (!selectedClass || !allClasses.some((entry) => entry.id === selectedClass.id)) {
      setSelectedClass(allClasses[0]);
    }
  }, [allClasses, selectedClass, setSelectedClass]);

  const todayDay = getDayOfWeek(selectedDate);
  const todaysRoutines = routines
    .filter((routine) => routine.classId === selectedClass?.id && routine.dayOfWeek === todayDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const formatTime = (value: string) =>
    new Date(`2000-01-01T${value}:00`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const formattedDate = new Date(`${selectedDate}T00:00:00`).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });

  const teachers = allUsers.filter((entry) => entry.role === 'teacher');

  const stats = [
    { label: 'Teachers', value: coordinatorSummary?.totalTeachers ?? 0, icon: UserSquare2, accent: 'border-l-sky-500 bg-sky-100 text-sky-600' },
    { label: 'Children', value: coordinatorSummary?.totalChildren ?? 0, icon: Users, accent: 'border-l-emerald-500 bg-emerald-100 text-emerald-600' },
    { label: 'Parents', value: coordinatorSummary?.totalParents ?? 0, icon: Users, accent: 'border-l-amber-500 bg-amber-100 text-amber-600' },
  ];

  // current avatar for preview
  const currentAvatar = user.avatar;
  const previewPhoto = profilePhoto || (currentAvatar?.startsWith('data:') ? currentAvatar : '');

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            {/* Coordinator avatar */}
            <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg overflow-hidden shrink-0">
              {currentAvatar?.startsWith('data:') ? (
                <img src={currentAvatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <span>{currentAvatar}</span>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-indigo-600 mb-1">Coordinator Dashboard</p>
              <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
              <p className="text-gray-500 mt-1 text-sm">Overview of teaching staff, enrolled children, parents, and recent announcements.</p>
            </div>
          </div>
          <Button variant="secondary" onClick={openEdit}>
            <Pencil size={14} /> Edit Profile
          </Button>
        </div>

        {/* Inline edit profile form */}
        {editingProfile && (
          <div className="mt-5 p-4 bg-indigo-50 rounded-xl border border-indigo-100 space-y-4">
            <h4 className="font-semibold text-gray-800 text-sm">Edit Your Profile</h4>

            {/* Photo upload */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-indigo-100 overflow-hidden flex items-center justify-center font-bold text-indigo-700 shrink-0">
                {previewPhoto ? (
                  <img src={previewPhoto} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <span>{currentAvatar?.startsWith('data:') ? '' : currentAvatar}</span>
                )}
              </div>
              <div>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  ref={photoRef}
                  className="hidden"
                  onChange={handlePhotoChange}
                />
                <Button variant="secondary" onClick={() => photoRef.current?.click()}>
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map(({ label, value, icon: Icon, accent }) => (
          <Card key={label} className="p-5 flex items-center gap-4 border-l-4">
            <div className={`p-3 rounded-full ${accent}`}>
              <Icon />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{label}</p>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="flex flex-col">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Clock3 size={18} className="text-sky-600" />
              <h3 className="font-bold text-lg">
                Today&apos;s Routine <span className="text-gray-500 text-sm font-normal ml-2">{formattedDate}</span>
              </h3>
            </div>
            {allClasses.length > 0 && (
              <select
                className="bg-gray-50 border border-gray-200 text-gray-700 px-2 py-1 rounded-md text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 max-w-[140px] md:max-w-[200px]"
                value={selectedClass?.id || ''}
                onChange={(e) => {
                  const targetClass = allClasses.find((entry) => entry.id === e.target.value);
                  if (targetClass) setSelectedClass(targetClass);
                }}
              >
                {allClasses.map((entry) => (
                  <option key={entry.id} value={entry.id}>{entry.name}</option>
                ))}
              </select>
            )}
          </div>
          <div className="p-4 space-y-4">
            {todaysRoutines.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-6 py-10 text-center">
                <p className="font-semibold text-gray-700">No periods scheduled for today.</p>
                <p className="mt-1 text-sm text-gray-500">Open the routines tab to view the full weekly routine.</p>
              </div>
            ) : (
              todaysRoutines.map((routine) => (
                <div key={routine.id} className="grid grid-cols-[100px_minmax(0,1fr)] gap-4">
                  <div className="flex flex-col justify-center text-sm font-semibold text-gray-700">
                    <span>{formatTime(routine.startTime)}</span>
                    <span className="text-gray-400">{formatTime(routine.endTime)}</span>
                  </div>
                  <div className="rounded-2xl border border-sky-200 bg-sky-100/80 px-5 py-4 shadow-sm">
                    <p className="text-lg font-bold text-gray-900">{routine.title}</p>
                    <p className="mt-2 text-sm text-gray-700">{routine.teacherName ?? teachers.find((entry) => entry.id === routine.teacherId)?.name ?? 'Assigned teacher'}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card>
          <div className="p-4 border-b border-gray-100 flex items-center gap-2">
            <Megaphone size={18} className="text-indigo-600" />
            <h3 className="font-bold text-lg">Recent Announcements</h3>
          </div>
          <div className="p-4 space-y-4">
            {(coordinatorSummary?.announcements ?? []).length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-6 py-10 text-center">
                <p className="font-semibold text-gray-700">No announcements yet.</p>
              </div>
            ) : (
              (coordinatorSummary?.announcements ?? []).map((announcement: Announcement) => (
                <div key={announcement.id} className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                  <div className="flex justify-between items-start gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <Badge color={announcement.type === 'urgent' ? 'red' : announcement.type === 'event' ? 'green' : 'blue'}>
                        {announcement.type}
                      </Badge>
                      <span className="text-xs text-gray-500">{announcement.author}</span>
                    </div>
                    <span className="text-xs text-gray-400">{announcement.date}</span>
                  </div>
                  <p className="text-sm text-gray-800">{announcement.text}</p>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
