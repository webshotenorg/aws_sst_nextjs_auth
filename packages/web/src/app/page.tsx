import { LoginButton } from '@/components/AuthButton';

export default async function Home() {
  //const data = await fetch(process.env.NEXT_PUBLIC_API_URL || '');
  return (
    <div>
      {/* {await data.text()} */}
      <LoginButton />
    </div>
  );
}
