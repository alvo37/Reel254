"use client";
import Footer from "@/components/reusables/Footer/Footer";
import Navbar from "@/components/reusables/Navbar/Navbar";
import { backendService } from "@/services/backendService";
import "./page.css";
import { useEffect, useState } from "react";
import Hero from "@/components/landing/Hero";
import { RecentFilms } from "@/components/landing/RecentFilms";
import { LandingDataType } from "@/types/types";
import Top6 from "@/components/landing/Top6";
import Features from "@/components/landing/Features";
import CTAButtons from "@/components/landing/CTAButtons";

const landingDataDefault: LandingDataType = {
  recent_films: [],
  top_6_recent_films: [],
  trending_film: null,
  recent_reviews: [],
};

export default function Landing() {
  const [loading, setLoading] = useState(true);
  const [landingData, setLandingData] =
    useState<LandingDataType>(landingDataDefault);

  useEffect(() => {
    setLoading(true);
    backendService
      .landingData()
      .then((data) => {
        console.log("Landing data:", data);
        setLandingData(data || landingDataDefault);
      })
      .catch((error) => {
        console.error("Error fetching landing data:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className='landing-page'>
      <Navbar />
      <main className='landing-main'>
        <Hero trending_film={landingData.trending_film} />
        <CTAButtons />
        <Top6 Top6={landingData.top_6_recent_films} loading={loading} />
        <Features />
        <RecentFilms
          recent_films={landingData.recent_films}
          loading={loading}
        />
      </main>
      <Footer />
    </div>
  );
}
