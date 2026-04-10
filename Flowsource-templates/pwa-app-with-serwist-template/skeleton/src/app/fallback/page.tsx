import Link from 'next/link';

export default function Page() {
  return (
    <>
      <div>
        <h1>Fallback !!! This is a fallback page when device is offline</h1>
        <small>Route will fallback to this page</small>
      </div>
      <Link href="/" prefetch={false}>
        back home
      </Link>
    </>
  );
}
