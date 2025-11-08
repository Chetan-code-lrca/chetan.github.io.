import { useState } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import AuthDialog from "./components/AuthDialog";

const Index = () => {
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Navbar onAuthClick={() => setAuthOpen(true)} />
      <Hero onGetStarted={() => setAuthOpen(true)} />
      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
    </div>
  );
};

export default Index;
