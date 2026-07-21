import { useUser } from '@clerk/nextjs';
import Link from 'next/link';

type NavLinksProps = {
  onClose?: () => void;
};

export default function NavLinks({ onClose }: NavLinksProps) {
  const { user } = useUser();

  const handleClick = () => {
    if (onClose) onClose();
  };

  return (
    <nav className="nav-middle nav-section">
      {!user && (
        <>
          <Link href={'/auth/sign-in'} onClick={handleClick}>SIGN IN</Link>
          <Link href={'/auth/sign-up'} onClick={handleClick}>CREATE ACCOUNT</Link>
        </>
      )}
      <Link href={'/films'} onClick={handleClick}>FILMS</Link>
      <Link href={'/tvshows'} onClick={handleClick}>TVSHOWS</Link>
      <Link href={'/feed'} onClick={handleClick}>FEED</Link>
      <Link href={'/me'} onClick={handleClick}>ME</Link>
    </nav>
  );
}
