"use client";
import React from "react";

function MainComponent() {
  const { data: user } = useUser();
  const [callSettings, setCallSettings] = useState({
    goal: "",
    targetNumber: "",
    targetContext: "",
    instructions: "",
    actAsUser: false,
    agreedToTerms: false,
  });
  const [stats, setStats] = useState({
    totalCalls: 0,
    totalSuccess: 0,
    minutesSaved: 0,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!callSettings.agreedToTerms) {
      alert("Please agree to terms and conditions");
      return;
    }

    try {
      const response = await fetch("/api/create-call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...callSettings,
          callType: callSettings.actAsUser ? "clone" : "assistant",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create call");
      }

      const data = await response.json();
      window.location.href = `/active-call/${data.callId}`;
    } catch (error) {
      console.error("Error creating call:", error);
      alert("Failed to create call. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0b1e] text-white font-['Sudo'] p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <h1 className="text-3xl font-bold text-blue-400">
          Welcome, {user?.name || "Friend"}
        </h1>
      </div>

      <div className="max-w-7xl mx-auto flex gap-8">
        {/* Left Navigation */}
        <div className="w-64 space-y-4">
          <div className="bg-[#1a1b3e] rounded-xl p-4">
            <nav className="space-y-3">
              {[
                { icon: "📋", label: "Task History" },
                { icon: "⚙️", label: "Call Settings" },
                { icon: "✨", label: "Special Features" },
                { icon: "🎤", label: "Voice Clone" },
                { icon: "➕", label: "Additional Features" },
              ].map((item) => (
                <a
                  key={item.label}
                  href="#"
                  className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-blue-500/20 text-gray-300 hover:text-white transition-colors"
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </a>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 space-y-8">
          {/* Call Setup Form */}
          <div className="bg-[#1a1b3e] rounded-xl p-6">
            <h2 className="text-2xl font-bold mb-6">New Task Setup</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-2">
                    What's your goal?
                  </label>
                  <input
                    type="text"
                    value={callSettings.goal}
                    onChange={(e) =>
                      setCallSettings({ ...callSettings, goal: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-[#0a0b1e] border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="e.g., Cancel my subscription"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2">
                    Who should we call? (phone number)
                  </label>
                  <input
                    type="tel"
                    value={callSettings.targetNumber}
                    onChange={(e) =>
                      setCallSettings({
                        ...callSettings,
                        targetNumber: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 bg-[#0a0b1e] border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="(555) 123-4567"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2">
                    Any context about who we're calling?
                  </label>
                  <input
                    type="text"
                    value={callSettings.targetContext}
                    onChange={(e) =>
                      setCallSettings({
                        ...callSettings,
                        targetContext: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 bg-[#0a0b1e] border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="e.g., Gym membership service department"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2">
                    Special instructions or details?
                  </label>
                  <textarea
                    value={callSettings.instructions}
                    onChange={(e) =>
                      setCallSettings({
                        ...callSettings,
                        instructions: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 bg-[#0a0b1e] border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
                    rows="3"
                    placeholder="e.g., My membership number is 12345, I want to cancel due to relocation"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={callSettings.agreedToTerms}
                    onChange={(e) =>
                      setCallSettings({
                        ...callSettings,
                        agreedToTerms: e.target.checked,
                      })
                    }
                    className="rounded border-gray-700"
                  />
                  <span className="text-sm">
                    I agree to the terms and conditions
                  </span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={callSettings.actAsUser}
                    onChange={(e) =>
                      setCallSettings({
                        ...callSettings,
                        actAsUser: e.target.checked,
                      })
                    }
                    className="rounded border-gray-700"
                  />
                  <span className="text-sm">
                    Please act as if you are me (if not checked, act as
                    assistant)
                  </span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg hover:opacity-90"
              >
                Make Call
              </button>
            </form>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-[#1a1b3e] rounded-xl p-6">
              <h3 className="text-xl mb-2">Total Tasks</h3>
              <div className="text-3xl font-bold text-blue-400">
                #{stats.totalCalls}
              </div>
            </div>

            <div className="bg-[#1a1b3e] rounded-xl p-6">
              <h3 className="text-xl mb-2">Success Rate</h3>
              <div className="text-3xl font-bold text-green-400">
                #{stats.totalSuccess}
              </div>
            </div>

            <div className="bg-[#1a1b3e] rounded-xl p-6">
              <h3 className="text-xl mb-2">Time Saved</h3>
              <div className="text-3xl font-bold text-purple-400">
                #{stats.minutesSaved}m
              </div>
            </div>
          </div>

          {/* Recommended Uses & Special Features */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-[#1a1b3e] rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-4">Recommended Uses</h2>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                  Cancel subscriptions & memberships
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                  Negotiate bills & fees
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                  Schedule appointments
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                  Handle customer service issues
                </li>
              </ul>
            </div>

            <div className="bg-[#1a1b3e] rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-4">Special Features</h2>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                  Voice cloning technology
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                  Real-time call monitoring
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                  Automated follow-ups
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                  Success guarantee
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Twinkling Stars Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden opacity-30">
        {Array.from({ length: 100 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: Math.random() * 2 + "px",
              height: Math.random() * 2 + "px",
              top: Math.random() * 100 + "%",
              left: Math.random() * 100 + "%",
              animation: `pulse ${Math.random() * 3 + 2}s infinite`,
            }}
          />
        ))}
      </div>

      <style jsx global>{`
        @keyframes pulse {
          0% { opacity: 0.2; }
          50% { opacity: 1; }
          100% { opacity: 0.2; }
        }
      `}</style>
    </div>
  );
}

export default MainComponent;