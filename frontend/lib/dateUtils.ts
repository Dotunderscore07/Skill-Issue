export const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
};

export const getDayOfWeek = (dateStr: string) =>
  ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][new Date(`${dateStr}T00:00:00`).getDay()] as string;

export const formatTime = (value: string) => {
  try {
    return new Date(`2000-01-01T${value}:00`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch (e) {
    return value;
  }
};

export const formatDateFull = (dateStr: string) => {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString('en-US', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
};
