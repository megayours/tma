import { useSession } from '@/auth/SessionProvider';

export const PreviewContent = () => {
  const { session } = useSession();

  return <h1 className="">Hello</h1>;
};
