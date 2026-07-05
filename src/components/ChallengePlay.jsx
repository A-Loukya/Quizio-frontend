import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, CheckCircle2, ChevronRight, HelpCircle, Loader2, Trophy, RotateCcw } from 'lucide-react';
import ScratchToReveal from './ui/scratch-to-reveal';
import { API_BASE_URL } from '../config';

const ChallengePlay = () => {
  const { lobbyCode } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const nickname = location.state?.nickname;

  const [lobbyData, setLobbyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState({}); // { [idx]: answerString }
  const [isFinished, setIsFinished] = useState(false);
  const [timeTaken, setTimeTaken] = useState(0);
  const [score, setScore] = useState(0);
  const [scratched, setScratched] = useState(false);
  const [submittingScore, setSubmittingScore] = useState(false);

  // Redirect back to lobby if nickname is missing
  useEffect(() => {
    if (!nickname) {
      navigate(`/challenge/${lobbyCode}`);
    }
  }, [nickname, lobbyCode, navigate]);

  // Fetch challenge details
  useEffect(() => {
    const fetchLobby = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/lobbies/${lobbyCode}`);
        if (!response.ok) {
          throw new Error('Lobby not found');
        }
        const data = await response.json();
        setLobbyData(data);
      } catch (err) {
        console.error('Fetch Play Lobby Error:', err);
        navigate(`/challenge/${lobbyCode}`);
      } finally {
        setLoading(false);
      }
    };
    fetchLobby();
  }, [lobbyCode, navigate]);

  // Timer interval
  useEffect(() => {
    if (loading || isFinished || !lobbyData) return;
    const timer = setInterval(() => {
      setTimeTaken((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [loading, isFinished, lobbyData]);

  if (loading || !lobbyData) {
    return (
      <div className="min-h-screen bg-[#060814] text-white flex flex-col justify-center items-center font-Lato">
        <Loader2 className="w-10 h-10 text-cyan-400 animate-spin mb-4" />
        <p className="text-gray-400 font-light">Entering play room...</p>
      </div>
    );
  }

  const questions = lobbyData.questions;
  const currentQuestion = questions[currentIdx];

  const handleAnswerSelect = (answer) => {
    setUserAnswers((prev) => ({
      ...prev,
      [currentIdx]: answer,
    }));
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      calculateAndSubmitScore();
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx((prev) => prev - 1);
    }
  };

  const checkIfCorrect = (correctAnswer, userAnswer, options, type) => {
    if (!correctAnswer || !userAnswer) return false;
    const cleanAnswer = String(correctAnswer).trim().toLowerCase();
    const cleanUser = String(userAnswer).trim().toLowerCase();

    if (type === 'mcqs' && options) {
      // Check for letter (A, B, C, D)
      if (cleanAnswer.length === 1 && ['a', 'b', 'c', 'd'].includes(cleanAnswer)) {
        const optionLetterIdx = cleanAnswer.charCodeAt(0) - 'a'.charCodeAt(0);
        const selectedIndex = options.findIndex((opt) => opt.trim().toLowerCase() === cleanUser);
        return selectedIndex === optionLetterIdx;
      }
      return cleanUser === cleanAnswer;
    }
    return cleanUser === cleanAnswer;
  };

  const calculateAndSubmitScore = async () => {
    setIsFinished(true);
    setSubmittingScore(true);

    let calculatedScore = 0;
    questions.forEach((q, idx) => {
      const userAnswer = userAnswers[idx];
      const correct = checkIfCorrect(q.correctAnswer, userAnswer, q.options, lobbyData.quizType);
      if (correct) {
        calculatedScore++;
      }
    });

    setScore(calculatedScore);

    try {
      const res = await fetch(`${API_BASE_URL}/api/lobbies/${lobbyCode}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: nickname,
          score: calculatedScore,
          totalQuestions: questions.length,
          timeTaken,
        }),
      });

      if (!res.ok) {
        console.warn('Failed to submit challenge score to server');
      }
    } catch (err) {
      console.error('Error logging challenge score:', err);
    } finally {
      setSubmittingScore(false);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  const answeredCount = Object.keys(userAnswers).length;
  const progressPercent = (answeredCount / questions.length) * 100;

  return (
    <div className="relative min-h-screen bg-[#060814] text-white overflow-hidden pb-16 font-Lato pt-24 flex flex-col items-center justify-center p-6">
      {/* Background glow spots */}
      <div className="absolute top-1/4 left-[-10%] w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-[-10%] w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Floating Header info */}
      <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-full max-w-4xl px-6 flex items-center justify-between pointer-events-none">
        <button
          onClick={() => navigate(`/challenge/${lobbyCode}`)}
          className="pointer-events-auto flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-white/10 bg-[#0b0e22]/80 backdrop-blur-md text-xs font-semibold text-gray-300 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Leave Lobby
        </button>

        <div className="flex items-center gap-2.5 px-4 py-2 rounded-full border border-white/10 bg-[#0b0e22]/80 backdrop-blur-md text-xs text-gray-300 font-mono">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span>Timer: {formatTime(timeTaken)}</span>
        </div>
      </div>

      {!isFinished ? (
        <div className="w-full max-w-xl z-10">
          {/* Progress Section */}
          <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] uppercase tracking-wider text-cyan-400 font-bold font-Fredoka">
              Question {currentIdx + 1} of {questions.length}
            </span>
            <span className="text-[10px] text-gray-500 font-mono">
              Progress: {answeredCount}/{questions.length} answered
            </span>
          </div>

          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mb-6">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Question Card */}
          <div className="backdrop-blur-xl bg-[#0c0e22]/80 border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-[30px]" />

            <h3 className="text-lg md:text-xl font-Fredoka font-bold text-white mb-8 leading-snug">
              {currentQuestion.question}
            </h3>

            {/* Answer Templates based on quizType */}
            {lobbyData.quizType === 'mcqs' && currentQuestion.options && (
              <div className="flex flex-col gap-3">
                {currentQuestion.options.map((option, oIdx) => {
                  const letter = String.fromCharCode(65 + oIdx); // A, B, C, D
                  const isSelected = userAnswers[currentIdx] === option;
                  return (
                    <button
                      key={oIdx}
                      onClick={() => handleAnswerSelect(option)}
                      className={`flex items-center gap-4 px-5 py-4 border rounded-xl text-sm font-semibold text-left active:scale-[0.99] transition-all cursor-pointer ${
                        isSelected
                          ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-300 shadow-md shadow-cyan-500/5'
                          : 'border-white/5 bg-white/[0.01] hover:bg-white/[0.03] text-gray-300 hover:text-white'
                      }`}
                    >
                      <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold border shrink-0 ${
                        isSelected ? 'border-cyan-400/30 bg-cyan-400/20 text-cyan-300' : 'border-white/10 bg-white/5 text-gray-400'
                      }`}>
                        {letter}
                      </span>
                      <span>{option}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {lobbyData.quizType === 'T/F' && (
              <div className="flex gap-4 mt-8">
                {['True', 'False'].map((option) => {
                  const isSelected = userAnswers[currentIdx] === option;
                  return (
                    <button
                      key={option}
                      onClick={() => handleAnswerSelect(option)}
                      className={`flex-1 py-4 border rounded-xl text-sm font-semibold active:scale-[0.99] transition-all cursor-pointer ${
                        isSelected
                          ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-300 shadow-md shadow-cyan-500/5'
                          : 'border-white/5 bg-white/[0.01] hover:bg-white/[0.03] text-gray-300 hover:text-white'
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            )}

            {lobbyData.quizType === 'blanks' && (
              <div className="mt-6 flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-wider text-gray-500 font-bold font-Fredoka">Type your answer</label>
                <textarea
                  rows={2}
                  value={userAnswers[currentIdx] || ''}
                  onChange={(e) => handleAnswerSelect(e.target.value)}
                  placeholder="Type answer details here..."
                  className="w-full px-4 py-3 bg-[#070914] border border-white/10 rounded-xl focus:outline-none focus:border-cyan-500 text-sm transition-colors text-white resize-none"
                />
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex justify-between items-center mt-12 pt-6 border-t border-white/5">
              <button
                onClick={handlePrev}
                disabled={currentIdx === 0}
                className="px-5 py-2.5 rounded-xl border border-white/5 text-xs font-semibold text-gray-400 hover:text-white hover:bg-white/5 transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
              >
                Previous
              </button>

              <button
                onClick={handleNext}
                disabled={!userAnswers[currentIdx]}
                className="flex items-center gap-1.5 px-6 py-3 bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-white rounded-xl text-xs font-semibold shadow-md active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer font-Fredoka"
              >
                {currentIdx < questions.length - 1 ? (
                  <>
                    Next Question
                    <ChevronRight className="w-3.5 h-3.5" />
                  </>
                ) : (
                  <>
                    Submit Challenge
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-200" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Post Challenge Reveal & Leaderboard navigation screen */
        <div className="relative w-full max-w-md backdrop-blur-xl bg-[#0b0f24]/90 border border-white/10 rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center z-10">
          <Trophy className="w-12 h-12 text-yellow-400 mb-2 animate-bounce" />
          <h3 className="text-xl font-bold font-Fredoka text-white mb-2">
            Challenge Submitted!
          </h3>
          <p className="text-xs text-gray-400 mb-6 font-light">
            {!scratched 
              ? "Rub the metallic scratchcard below to reveal your rank score." 
              : "Splendid attempt! Let's see how you rank."
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
                {score} / {questions.length}
              </h2>
              <span className="text-[10px] text-gray-500 font-mono mt-1">
                TIME: {formatTime(timeTaken)}
              </span>
            </div>
          </ScratchToReveal>

          {/* Action Row */}
          <div className={`mt-8 w-full transition-all duration-500 ${
            scratched ? "opacity-100 translate-y-0" : "opacity-30 pointer-events-none"
          }`}>
            <button
              onClick={() => navigate(`/challenge/${lobbyCode}`)}
              disabled={submittingScore}
              className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-white rounded-xl text-sm font-semibold active:scale-95 shadow-md hover:shadow-cyan-500/10 transition-all font-Fredoka flex items-center justify-center gap-2 cursor-pointer"
            >
              {submittingScore ? (
                <span>Saving placement...</span>
              ) : (
                <>
                  <Trophy className="w-4 h-4 fill-white" />
                  View Lobby Leaderboard
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChallengePlay;
