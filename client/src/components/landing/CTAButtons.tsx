import Link from "next/link";

export default function CTAButtons() {
  return (
    <section className='limited-width cta-buttons'>
      <div className='auth-buttons'>
        <Link href='/auth/sign-up' className='cta'>
          Get Started!
        </Link>
      </div>
    </section>
  );
}
