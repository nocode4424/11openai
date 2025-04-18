"use client";
import React from "react";

function MainComponent() {
  const { data: user, loading: userLoading } = useUser();
  const [isConnected, setIsConnected] = useState(false);
  const [transcript, setTranscript] = useState([]);
  const [currentSpeaker, setCurrentSpeaker] = useState(null);
  const [audioStream, setAudioStream] = useState(null);
  const [error, setError] = useState(null);
  const [callStatus, setCallStatus] = useState("connecting");

  useEffect(() => {
    if (!userLoading && !user) {
      window.location.href = "/account/signin?callbackUrl=/call/active";
    }
  }, [user, userLoading]);

  useEffect(() => {
    if (!user) return; // Don't connect if not authenticated

    const socket = new WebSocket(
      "wss://api.elevenlabs.io/v1/text-to-speech/stream"
    );

    socket.onopen = () => {
      setIsConnected(true);
      setCallStatus("connected");
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "transcript") {
        setTranscript((prev) => [...prev, data.message]);
        setCurrentSpeaker(data.speaker);
      } else if (data.type === "audio") {
        setAudioStream(data.audioContent);
      }
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
      setError("Connection error occurred");
      setCallStatus("error");
    };

    socket.onclose = () => {
      setIsConnected(false);
      setCallStatus("disconnected");
    };

    const keepAlive = setInterval(() => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(" ");
      }
    }, 20000);

    return () => {
      clearInterval(keepAlive);
      socket.close();
    };
  }, [user]);

  const handleEndCall = async () => {
    setCallStatus("ending");
    try {
      const response = await fetch("/api/calls/end", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transcript,
          userId: user?.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to end call");
      }

      window.location.href = "/dashboard";
    } catch (err) {
      console.error(err);
      setError("Failed to end call properly");
    }
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-black text-white font-sudo-bold flex items-center justify-center">
        <div className="animate-pulse text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
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
          <div className="max-w-4xl mx-auto">
            <div className="mb-8 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div
                  className={`w-4 h-4 rounded-full ${
                    callStatus === "connected"
                      ? "bg-green-500"
                      : callStatus === "connecting"
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  } animate-pulse`}
                ></div>
                <span className="text-xl">
                  {callStatus === "connected"
                    ? "Call in Progress"
                    : callStatus === "connecting"
                    ? "Connecting..."
                    : callStatus === "ending"
                    ? "Ending Call..."
                    : "Call Ended"}
                </span>
              </div>
              <button
                onClick={handleEndCall}
                className="px-6 py-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-full hover:opacity-90 transition-opacity"
                disabled={callStatus === "ending"}
              >
                {callStatus === "ending" ? "Ending..." : "End Call"}
              </button>
            </div>

            <LiveCallTranscript
              transcript={transcript}
              isConnected={isConnected}
              currentSpeaker={currentSpeaker}
            />

            <div className="mt-8 flex justify-center gap-4">
              <button className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full hover:opacity-90 transition-opacity">
                <i className="fas fa-microphone text-2xl"></i>
              </button>
              <button className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full hover:opacity-90 transition-opacity">
                <i className="fas fa-volume-up text-2xl"></i>
              </button>
              <button className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full hover:opacity-90 transition-opacity">
                <i className="fas fa-keyboard text-2xl"></i>
              </button>
            </div>

            {error && (
              <div className="mt-4 p-4 bg-red-500/20 rounded-lg text-red-300">
                {error}
              </div>
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