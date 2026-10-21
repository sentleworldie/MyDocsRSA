import { Redirect } from 'expo-router';

import { useAuth } from '@/context/AuthContext';

/**
 * The app's front door ("/"). It sends each person to the right place:
 * signed out -> sign-in, then user / officer / admin each to their own home screen.
 */
export default function Index() {
  const { user } = useAuth();

  if (!user) return <Redirect href="/login" />;

  switch (user.role) {
    case 'ADMIN':
      return <Redirect href="/overview" />;
    case 'POLICE_OFFICER':
      return <Redirect href="/queue" />;
    default:
      return <Redirect href="/wallet" />;
  }
}
