import React, { useState, useEffect } from "react";
import ScratchToReveal from "./ui/scratch-to-reveal";
import { Eye, RotateCcw, Brain, Share2 } from "lucide-react";
import { API_BASE_URL } from "../config";

const ScoreModal = ({ score, total, isVisible, onSeeAnswers, onTryAgain, feedback, quizId }) => {
  const [scratched, setScratched] = useState(false);
  const [loadingLobby, setLoadingLobby] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  // Reset internal states if modal visibility changes (e.g. on Retry)
  useEffect(() => {
    if (!isVisible) {
      setScratched(false);
      setShareCopied(false);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  const accuracy = total > 0 ? Math.round((score / total) * 100) : 0;

  const handleChallengeFriends = async () => {
    if (!quizId) return;
    setLoadingLobby(true);
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_BASE_URL}/api/lobbies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ quizId })
      });

      if (response.ok) {
        const data = await response.json();
        const lobbyCode = data.lobbyCode;
        const shareUrl = `${window.location.origin}/challenge/${lobbyCode}`;
        await navigator.clipboard.writeText(shareUrl);
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 3000);
      } else {
        alert('Failed to generate challenge link. Please try again.');
      }
    } catch (err) {
      console.error('Error creating challenge lobby:', err);
      alert('Failed to connect to the server.');
    } finally {
      setLoadingLobby(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-md backdrop-blur-xl bg-[#0b0f24]/90 border border-white/10 rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center max-h-[90vh] overflow-y-auto no-scrollbar">
        <h3 className="text-xl font-bold font-Fredoka text-white mb-2">
          Quiz Submitted!
        </h3>
        <p className="text-xs text-gray-400 mb-6 font-light">
          {!scratched 
            ? "Rub the metallic scratchcard below to reveal your score." 
            : "Excellent work! Your attempt has been saved."
          }
        </p>

        <ScratchToReveal
          width={280}
          height={140}
          minScratchPercentage={45}
          className="flex items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-[#070914] shadow-inner"
          onComplete={() => setScratched(true)}
          gradientColors={['#06b6d4', '#6366f1', '#a855f7']}
        >
          <div className="flex flex-col justify-center items-center h-full select-none">
            <span className="text-[10px] uppercase tracking-wider text-cyan-400 font-semibold mb-1 font-Fredoka">
              Final Result
            </span>
            <h2 className="text-4xl font-extrabold font-Fredoka text-white">
              {score} / {total}
            </h2>
            <span className="text-[10px] text-gray-500 font-mono mt-1">
              {accuracy}% ACCURACY
            </span>
          </div>
        </ScratchToReveal>

        {/* Post-Scratch Options */}
        <div className={`mt-8 flex gap-4 w-full justify-center transition-all duration-500 ${
          scratched ? "opacity-100 translate-y-0" : "opacity-30 pointer-events-none"
        }`}>
          <button
            onClick={onSeeAnswers}
            className="flex items-center justify-center gap-2 flex-1 py-3 border border-white/10 hover:border-white/20 bg-white/5 rounded-xl text-sm font-semibold hover:bg-white/10 transition-colors font-Fredoka cursor-pointer"
          >
            <Eye className="w-4 h-4" />
            Answers
          </button>
          <button
            onClick={onTryAgain}
            className="flex items-center justify-center gap-2 flex-1 py-3 bg-red-500/20 border border-red-500/30 hover:border-red-500/40 text-red-300 rounded-xl text-sm font-semibold hover:bg-red-500/30 transition-colors font-Fredoka cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            Retry
          </button>
        </div>

        {/* Challenge Friends Action */}
        {scratched && quizId && (
          <div className="w-full mt-4">
            <button
              onClick={handleChallengeFriends}
              disabled={loadingLobby}
              className="w-full py-3.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:via-indigo-500 hover:to-cyan-400 text-white rounded-xl text-xs font-semibold shadow-md hover:shadow-cyan-500/20 active:scale-[0.98] transition-all font-Fredoka flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {loadingLobby ? (
                <span>Generating Challenge Link...</span>
              ) : shareCopied ? (
                <span className="text-cyan-200">✓ Challenge Link Copied!</span>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  Challenge Friends (Multiplayer)
                </>
              )}
            </button>
          </div>
        )}

        {/* AI Coach Insights Panel */}
        {scratched && (
          <div className="mt-6 w-full text-left bg-white/[0.02] border border-white/5 p-5 rounded-2xl">
            <div className="flex items-center gap-2 mb-3 text-cyan-400 border-b border-white/5 pb-2">
              <Brain className="w-4.5 h-4.5 shrink-0 animate-pulse" />
              <h4 className="text-xs font-bold uppercase tracking-wider font-Fredoka">AI Coach Insights</h4>
            </div>
            
            {!feedback ? (
              <div className="flex flex-col gap-2 animate-pulse py-1">
                <div className="h-3 bg-white/10 rounded w-full"></div>
                <div className="h-3 bg-white/10 rounded w-11/12"></div>
                <div className="h-2.5 bg-white/5 rounded w-2/3 mt-1.5"></div>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <p className="text-[13px] text-gray-200 font-light leading-relaxed">
                  {feedback.summary}
                </p>
                {feedback.weakAreas && feedback.weakAreas.toLowerCase() !== "none" && (
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-red-400 font-bold block mb-1 font-Fredoka">Focus Areas:</span>
                    <p className="text-[12px] text-gray-300 leading-relaxed font-light">
                      {feedback.weakAreas}
                    </p>
                  </div>
                )}
                {feedback.recommendations && (
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-green-400 font-bold block mb-1 font-Fredoka">Study Advice:</span>
                    <div className="text-[12px] text-gray-300 leading-relaxed font-light flex flex-col gap-1.5">
                      {Array.isArray(feedback.recommendations) ? (
                        feedback.recommendations.map((rec, rIdx) => (
                          <div key={rIdx} className="flex items-start gap-2">
                            <span className="text-green-400 shrink-0 mt-0.5">•</span>
                            <span>{rec}</span>
                          </div>
                        ))
                      ) : (
                        <p>{feedback.recommendations}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ScoreModal;
