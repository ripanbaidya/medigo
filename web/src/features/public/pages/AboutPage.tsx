import React from "react";
import HomeNavbar from "../components/home/HomeNavbar";
import HomeFooter from "../components/home/HomeFooter";

const AboutPage: React.FC = () => {
  return (
    <div className="home-premium min-h-screen bg-black text-white">
      <HomeNavbar />
      <main className="pt-24 pb-16 max-w-5xl mx-auto px-4 sm:px-6">
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8 space-y-4">
          <h1 className="text-3xl sm:text-4xl font-bold">About Us</h1>
          <p className="text-gray-300 text-sm leading-relaxed">
            Medigo is a premium healthcare operations platform designed for
            modern clinics, doctors, and patients.
          </p>
          <p className="text-gray-300 text-sm leading-relaxed">
            We combine discovery, booking, communication, and engagement into
            one reliable system so healthcare teams can run faster workflows
            with better patient outcomes.
          </p>
          <p className="text-gray-400 text-sm leading-relaxed">
            Our goal is simple: help care providers deliver trusted, efficient,
            and seamless healthcare journeys at scale.
          </p>
        </section>
      </main>
      <HomeFooter />
    </div>
  );
};

export default AboutPage;
