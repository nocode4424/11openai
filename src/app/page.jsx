"use client";
import React from "react";

function MainComponent() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [verificationSent, setVerificationSent] = useState(false);

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/verify-phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to verify phone number");
      }

      setVerificationSent(true);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0b1e] text-white font-sans">
      <div className="relative">
        <div className="absolute inset-0 overflow-hidden opacity-50">
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

        <div className="relative z-10 container mx-auto px-4 py-12">
          <nav className="flex justify-between items-center mb-16">
            <div className="text-2xl font-bold">CallHelper</div>
            <a
              href="/account/signin"
              className="text-blue-400 hover:text-blue-300"
            >
              Sign In
            </a>
          </nav>

          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h1 className="text-6xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
                We Handle The Calls You Don't Want To Make
              </h1>

              <p className="text-2xl text-gray-300 mb-4">
                ANY call. ANY situation. NO exceptions.
              </p>
              <p className="text-xl text-gray-400">
                From angry landlords to the IRS, we make the calls you've been
                putting off.
              </p>
            </div>

            <div className="bg-[#1a1b3e] rounded-xl p-8 mb-16">
              <h2 className="text-2xl mb-6 text-center">
                Try Your First Call Free
              </h2>
              <form
                onSubmit={handlePhoneSubmit}
                className="space-y-4 max-w-md mx-auto"
              >
                <div>
                  <label className="block text-sm mb-2">
                    Your Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="(555) 123-4567"
                    className="w-full px-4 py-3 bg-[#0a0b1e] border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
                    disabled={loading}
                  />
                </div>
                {error && <p className="text-red-400">{error}</p>}
                {verificationSent && (
                  <p className="text-green-400">
                    Verification code sent! Check your phone.
                  </p>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg hover:opacity-90 disabled:opacity-50"
                >
                  {loading ? "Sending..." : "Get Started"}
                </button>
              </form>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <div className="bg-[#1a1b3e] p-6 rounded-lg">
                <h3 className="text-xl mb-3">The Scary Ones</h3>
                <ul className="space-y-2 text-gray-300">
                  <li>🏛️ IRS & Tax Agencies</li>
                  <li>💰 Debt Collectors</li>
                  <li>🏦 Bank Disputes</li>
                  <li>⚖️ Legal Matters</li>
                  <li>🏥 Insurance Claims</li>
                </ul>
              </div>
              <div className="bg-[#1a1b3e] p-6 rounded-lg">
                <h3 className="text-xl mb-3">The Tedious Ones</h3>
                <ul className="space-y-2 text-gray-300">
                  <li>📅 Appointments</li>
                  <li>🔌 Utility Companies</li>
                  <li>📱 Tech Support</li>
                  <li>✈️ Travel Issues</li>
                  <li>🏠 Property Management</li>
                </ul>
              </div>
              <div className="bg-[#1a1b3e] p-6 rounded-lg">
                <h3 className="text-xl mb-3">The Awkward Ones</h3>
                <ul className="space-y-2 text-gray-300">
                  <li>❌ Cancellations</li>
                  <li>💵 Refund Requests</li>
                  <li>😤 Complaints</li>
                  <li>🤝 Negotiations</li>
                  <li>🔄 Status Updates</li>
                </ul>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-500/10 to-purple-600/10 rounded-xl p-8 mb-16">
              <h2 className="text-3xl font-bold mb-6 text-center">
                How It Works
              </h2>
              <div className="grid md:grid-cols-4 gap-8">
                {[
                  {
                    step: 1,
                    title: "Tell Us Who",
                    desc: "Share who needs calling & why",
                  },
                  {
                    step: 2,
                    title: "We Call",
                    desc: "We handle the conversation",
                  },
                  {
                    step: 3,
                    title: "Stay Updated",
                    desc: "Watch progress in real-time",
                  },
                  {
                    step: 4,
                    title: "Done!",
                    desc: "Get results without the stress",
                  },
                ].map((item) => (
                  <div key={item.step} className="text-center">
                    <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center mx-auto mb-4">
                      {item.step}
                    </div>
                    <h3 className="font-bold mb-2">{item.title}</h3>
                    <p className="text-gray-400">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-8">
              <h2 className="text-3xl font-bold text-center mb-8">
                Real Results
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  "Turned $1,100 Verizon bill into $0 + FREE iPad Pro & Apple Watch for the trouble 🎁",
                  "Completely eliminated a $54,000 medical bill down to $0 💪",
                  "Got cable company to cancel service without the usual run-around 📺",
                  "Negotiated with the IRS to reduce penalties by 70% 📊",
                  "Reversed $450 in bank fees across 3 accounts 💰",
                  "Got full refund on a 'non-refundable' hotel booking ✈️",
                  "Handled a 6-month insurance claim dispute in 2 days ⚡",
                  "Cancelled 12 subscriptions saving $230/month 💵",
                ].map((win, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 bg-[#1a1b3e] p-6 rounded-lg transform hover:scale-[1.02] transition-transform"
                  >
                    <div className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0 mt-2" />
                    <p className="text-lg">{win}</p>
                  </div>
                ))}
              </div>

              <div className="mt-12 text-center">
                <p className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-600 text-transparent bg-clip-text">
                  What's your impossible call?
                </p>
                <p className="text-gray-400 text-lg">
                  Let us handle it while you do literally anything else.
                </p>
              </div>
            </div>
          </div>
        </div>
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