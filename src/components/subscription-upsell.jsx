"use client";
import React from "react";



export default function Index() {
  return (function MainComponent({ callsRemaining = 0, onPurchaseClick }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="fixed top-4 right-4 z-50 font-sudo-bold"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button
        onClick={onPurchaseClick}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-900/50 to-pink-900/50 backdrop-blur-sm p-4 transition-transform hover:scale-105"
      >
        <div className="absolute inset-0 overflow-hidden">
          {[...Array.from({length: 10})].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                width: Math.random() * 2 + "px",
                height: Math.random() * 2 + "px",
                top: Math.random() * 100 + "%",
                left: Math.random() * 100 + "%",
                animation: `twinkle ${Math.random() * 3 + 2}s infinite`
              }}
            />
          ))}
        </div>
        
        <div className="relative z-10 flex items-center space-x-3">
          <div className="text-white">
            <div className="text-sm opacity-90">Calls Remaining</div>
            <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
              {callsRemaining}
            </div>
          </div>
          <div className={`transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-full px-4 py-2 text-white text-sm">
              Get More
            </div>
          </div>
        </div>
      </button>
      <div className="hidden">🌙</div>

      <style jsx global>{`
        @keyframes twinkle {
          0% { opacity: 0; }
          50% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}

function StoryComponent() {
  const handlePurchaseClick = () => {
    console.log("Redirecting to pricing page...");
  };

  return (
    <div className="min-h-screen bg-black p-4">
      <div className="space-y-8">
        <MainComponent 
          callsRemaining={5}
          onPurchaseClick={handlePurchaseClick}
        />
        <MainComponent 
          callsRemaining={0}
          onPurchaseClick={handlePurchaseClick}
        />
        <MainComponent 
          callsRemaining={10}
          onPurchaseClick={handlePurchaseClick}
        />
      </div>
    </div>
  );
});
}