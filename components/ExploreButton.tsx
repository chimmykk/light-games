import Link from 'next/link';

const ExploreButton = () => (
  <Link href="/explore">
    <a className="text-gray-300 hover:text-black">
      🧭 Explore
    </a>
  </Link>
);

export default ExploreButton;
