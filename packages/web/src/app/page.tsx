import { Resource } from 'sst';

export default async function Home() {
  const data = await fetch(process.env.NEXT_PUBLIC_API_URL || "");
  console.log(Resource);
  return <div>{await data.text()}</div>;
}
