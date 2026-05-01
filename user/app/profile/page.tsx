import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/auth';
import ProfileClient from './ProfileClient';

export const metadata = {
  title: 'My Profile - DravoHome',
  description: 'Manage your account settings and personal information',
};

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/auth/signin?callbackUrl=/profile');
  }

  return <ProfileClient session={session} />;
}
