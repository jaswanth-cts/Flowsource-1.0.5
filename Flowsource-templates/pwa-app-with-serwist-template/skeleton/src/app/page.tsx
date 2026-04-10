import Image from "next/image";
import Link from 'next/link';

export default function Home() {
  return (
    <main>
      <h1>Hello World !!!</h1>
      <h2>This is Sample PWA App with Serwist and Next.js</h2>
        <br/>
        <div>
        <p>
          The Link below is not prefetched. If you go offline before visiting
          it, you will fallback to an offline page (wait for it..).
        </p>
        <p>
          If you visit it while online, come back here, and then go offline, it
          will then be available offline - served from cache.
        </p>
        <br/>
        <Link href="/cached-on-nav" prefetch={false} >
          Click Here
        </Link>
      </div>
      <br></br>
      <div>
        <Image
          className="relative dark:drop-shadow-[0_0_0.3rem_#ffffff70] dark:invert"
          src="/next.svg"
          alt="Next.js Logo"
          width={180}
          height={37}
          priority
        />
      </div>
    </main>
  );
}
