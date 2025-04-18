"use client";
import React from "react";



export default function Index() {
  return (function MainComponent({ transcript = [], isConnected = false, currentSpeaker = null }) {
  return (
    <div className="min-h-screen bg-black text-white font-sudo-bold">
      <div className="relative">
        <div className="absolute inset-0 overflow-hidden">
          {[...Array.from({ length: 50 })].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                width: Math.random() * 3 + "px",
                height: Math.random() * 3 + "px",
                top: Math.random() * 100 + "%",
                left: Math.random() * 100 + "%",
                animation: `twinkle ${Math.random() * 3 + 2}s infinite`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-4xl mx-auto p-6">
          <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 backdrop-blur-sm rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                Live Transcript
              </h2>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm">{isConnected ? 'Connected' : 'Disconnected'}</span>
              </div>
            </div>

            <div className="bg-black/30 rounded-xl p-6 h-[600px] overflow-y-auto space-y-4">
              {transcript.map((entry, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg ${
                    entry.speaker === 'ai' ? 'bg-purple-900/30' : 'bg-pink-900/30'
                  }`}
                >
                  <div className="text-sm text-gray-400 mb-1">
                    {entry.speaker === 'ai' ? '🤖 AI Assistant' : '👤 User'}
                  </div>
                  <div className="font-crimson-text">{entry.text}</div>
                </div>
              ))}
              {currentSpeaker && (
                <div className="text-purple-400 animate-pulse">
                  {currentSpeaker === 'ai' ? '🤖 AI is speaking...' : '👤 User is speaking...'}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="hidden">🌙</div>
      </div>

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
  const sampleTranscript = [
    { speaker: 'ai', text: "Hello! How can I assist you today?" },
    { speaker: 'user', text: "I'd like to schedule a doctor's appointment." },
    { speaker: 'ai', text: "I'll help you with that. What's your preferred date and time?" },
    { speaker: 'user', text: "Sometime next week, preferably in the morning." },
    { speaker: 'ai', text: "I see several available slots next week. How about Tuesday at 9:30 AM?" },
  ];

  return (
    <div>
      <MainComponent 
        transcript={[]} 
        isConnected={false} 
        currentSpeaker={null} 
      />
      
      <MainComponent 
        transcript={sampleTranscript} 
        isConnected={true} 
        currentSpeaker="ai" 
      />
    </div>
  );
});
}