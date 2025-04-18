"use client";
import React from "react";
import SubscriptionUpsell from "../../components/subscription-upsell";
import SubscriptionUpsell from "../../components/subscription-upsell";

function MainComponent() {
  const { data: user, loading: userLoading } = useUser();
  const [callType, setCallType] = useState(null);
  const [callDetails, setCallDetails] = useState({
    goal: "",
    targetNumber: "",
    targetContext: "",
    instructions: "",
    toneDescription: "",
  });
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [credits, setCredits] = useState(0);
  const [loadingCredits, setLoadingCredits] = useState(true);

  useEffect(() => {
    if (!userLoading && !user) {
      window.location.href = "/account/signin?callbackUrl=/call/create";
    }
  }, [user, userLoading]);

  useEffect(() => {
    const checkCredits = async () => {
      try {
        const response = await fetch("/api/subscription/status", {
          method: "POST",
        });
        const data = await response.json();
        setCredits(data.credits || 0);
        setLoadingCredits(false);
      } catch (err) {
        console.error(err);
        setError("Could not check credits");
        setLoadingCredits(false);
      }
    };

    if (user) {
      checkCredits();
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/calls/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          callType,
          ...callDetails,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to create call");
      }
      // Redirect to active call UI with callId
      window.location.href = `/call/active?callId=${data.call.id}`;
    } catch (err) {
      setError("Failed to start call. Please try again.");
      setIsSubmitting(false);
    }
  };

  const questions = [
    "What is the goal of this call?",
    "What's the phone number and who are we calling?",
    "Any specific instructions or information to include?",
    "What tone should we use for this call?",
  ];

  if (userLoading || loadingCredits) {
    return (
      <div className="min-h-screen bg-black text-white font-sudo-bold flex items-center justify-center">
        <div className="animate-pulse text-2xl">Loading...</div>
      </div>
    );
  }

  if (credits <= 0) {
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

          <div className="relative z-10 container mx-auto px-4 py-16">
            <div className="max-w-2xl mx-auto text-center">
              <h1 className="text-4xl md:text-6xl mb-8 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                Time to Power Up! 🚀
              </h1>
              <p className="text-xl mb-12 text-gray-300">
                Looks like you're out of call credits. Let's get you some more!
              </p>
              <SubscriptionUpsell
                callsRemaining={credits}
                onPurchaseClick={() => (window.location.href = "/pricing")}
              />
            </div>
          </div>
        </div>
        <div className="hidden">🌙</div>
      </div>
    );
  }

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

        <div className="relative z-10 container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-4xl md:text-6xl mb-8 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
              Create New Call
            </h1>

            {!callType ? (
              <div className="grid md:grid-cols-3 gap-8">
                {["clone", "self", "assistant"].map((type) => (
                  <div
                    key={type}
                    onClick={() => setCallType(type)}
                    className="p-6 rounded-2xl bg-gradient-to-br from-purple-900/50 to-pink-900/50 backdrop-blur-sm cursor-pointer hover:scale-105 transition-transform"
                  >
                    <h2 className="text-2xl mb-4 capitalize">{type}</h2>
                    <p className="text-gray-300">
                      {type === "clone"
                        ? "Make calls using your voice clone"
                        : type === "self"
                        ? "Make calls as yourself"
                        : "Let AI handle the call"}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-900/50 to-pink-900/50 backdrop-blur-sm">
                  <div className="mb-6">
                    <label className="block text-xl mb-2">
                      {questions[currentStep]}
                    </label>
                    <textarea
                      className="w-full px-4 py-3 bg-transparent border-2 border-purple-500 rounded-lg text-white focus:outline-none focus:border-pink-500"
                      rows="4"
                      value={
                        currentStep === 0
                          ? callDetails.goal
                          : currentStep === 1
                          ? callDetails.targetContext
                          : currentStep === 2
                          ? callDetails.instructions
                          : callDetails.toneDescription
                      }
                      onChange={(e) => {
                        const value = e.target.value;
                        setCallDetails((prev) => ({
                          ...prev,
                          [currentStep === 0
                            ? "goal"
                            : currentStep === 1
                            ? "targetContext"
                            : currentStep === 2
                            ? "instructions"
                            : "toneDescription"]: value,
                        }));
                      }}
                    />
                  </div>

                  <div className="flex justify-between">
                    <button
                      type="button"
                      onClick={() =>
                        setCurrentStep(Math.max(0, currentStep - 1))
                      }
                      className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full hover:opacity-90 disabled:opacity-50"
                      disabled={currentStep === 0}
                    >
                      Previous
                    </button>
                    {currentStep < questions.length - 1 ? (
                      <button
                        type="button"
                        onClick={() => setCurrentStep(currentStep + 1)}
                        className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full hover:opacity-90"
                      >
                        Next
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full hover:opacity-90 disabled:opacity-50"
                      >
                        {isSubmitting ? "Starting Call..." : "Start Call"}
                      </button>
                    )}
                  </div>
                </div>

                {error && (
                  <div className="p-4 bg-red-500/20 rounded-lg text-red-300">
                    {error}
                  </div>
                )}
              </form>
            )}
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

export default MainComponent;