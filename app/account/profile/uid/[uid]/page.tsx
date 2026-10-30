import { redirect } from 'next/navigation';

export default function OldProfileRedirect({ params }: { params: { uid: string } }) {
  redirect(`/profile/uid/${params.uid}`);
}

export const dynamic = 'force-dynamic';