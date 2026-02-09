import { Film } from "@/types/types";

export default function Hero({
  trending_film,
}: {
  trending_film: Film | null;
}) {
  return (
    <section className='hero'>
      <img
        className='backdrop-img'
        src={trending_film?.backdrop_url ?? "/images/loading.jpg"}
        alt={trending_film?.title}
      />
      <div className='hero-overlay'>
        <h1>Discover. Review. Connect.</h1>
        <p>Join a global community of film lovers.</p>
      </div>
    </section>
  );
}
