import React from "react";
import Header from "../components/Header";
import Hero from "../components/landing/Hero";
import Opportunity from "../components/landing/Opportunities";
import Benefits from "../components/landing/Benefits";
import About from "../components/landing/About";
import HowItWorks from "../components/landing/HowItWorks";

import Footer from "../components/Footer";
// import Contact from "../components/landing/Contact";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-200 transition-colors duration-300">
      <Header />

      <main className="space-y-32">
        <Hero />
        <About />
        <Benefits />
        <Opportunity />
        <HowItWorks />
        {/* <Contact /> */}
      </main>

      <Footer />
    </div>
  );
};

export default LandingPage;
