import React, { useRef, useState } from 'react';
import Header from './Header';
import ScoreModal from './ScoreModal';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCcw, Eye, Home } from 'lucide-react';
import { API_BASE_URL } from '../config';

const Blanks = ({ quiz, quizId }) => {
  const navigate = useNavigate();
  const answersRef = useRef([]); 
  const inputRefs = useRef([]); 
  const [isSubmit, setIsSubmit] = useState(false);
  const [score, setScore] = useState(0);
  const [showAnswers, setShowAnswers] = useState(false);
  // state managed by shared ScoreModal
  const [inputsState, setInputsState] = useState([]); // Track which blanks are filled to calculate progress
  const [feedback, setFeedback] = useState(null);

  const handleInputChange = (value, index) => {
    answersRef.current[index] = value.trim(); 
    
    // Update inputs state to trigger re-renders for progress calculations
    const updatedInputsState = [...inputsState];
    updatedInputsState[index] = value.trim().length > 0;
    setInputsState(updatedInputsState);
  };

  const handleSubmit = async () => {
    let calculatedScore = 0;

    quiz.forEach((item, index) => {
      const userAnswer = answersRef.current[index]?.toLowerCase() || '';
      const correctAnswer = item.correctAnswer?.toLowerCase() || '';
      if (userAnswer === correctAnswer) {
        calculatedScore++;
      }
    });

    setScore(calculatedScore); 
    setIsSubmit(true); 

    const correctness = quiz.map((item, index) => {
      const userAnswer = answersRef.current[index]?.toLowerCase() || '';
      const correctAnswer = item.correctAnswer?.toLowerCase() || '';
      return userAnswer === correctAnswer;
    });

    // Log attempt in database if quizId is available
    if (quizId) {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch(`${API_BASE_URL}/api/quizzes/attempt`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            quizId,
            score: calculatedScore,
            totalQuestions: quiz.length,
            correctness
          })
        });

        if (response.ok) {
          const data = await response.json();
          setFeedback(data.attempt?.feedback || null);
        }
      } catch (err) {
        console.error('Error logging quiz attempt:', err);
      }
    }
  };

  const handleShowAnswers = () => {
    setShowAnswers(true);
    setIsSubmit(false);
  };

  const handleTryAgain = () => {
    answersRef.current = [];
    inputRefs.current.forEach((input) => {
      if (input) input.value = ''; 
    });
    setInputsState([]);
    setScore(0);
    setIsSubmit(false);
    setShowAnswers(false);
    setFeedback(null);
  };

  const answeredCount = inputsState.filter(Boolean).length;
  const progressPercent = (answeredCount / quiz.length) * 100;

  return (
    <div className="relative min-h-screen bg-[#060814] text-white overflow-hidden pb-20 font-Lato">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-[-10%] w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-[-10%] w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none" />

      <Header />

      <div className="relative max-w-4xl mx-auto px-6 z-10 pt-6">
        {/* Navigation Breadcrumb */}
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 text-sm font-semibold mb-6 transition-colors group no-underline"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </Link>

        {/* Header Details */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-6 border-b border-white/10 gap-4">
          <div>
            <span className="text-xs uppercase tracking-wider text-cyan-400 font-bold mb-1 block font-Fredoka">
              Fill in the Blanks
            </span>
            <h1 className="text-3xl font-bold font-Fredoka tracking-tight text-white">
              Quiz Challenge
            </h1>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-sm text-gray-400 mb-1">
              Progress: {answeredCount} of {quiz.length} Questions
            </span>
            <div className="w-48 bg-white/5 h-2 rounded-full overflow-hidden border border-white/5">
              <div
                style={{ width: `${progressPercent}%` }}
                className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-full rounded-full transition-all duration-300"
              />
            </div>
          </div>
        </div>

        {/* Blanks List */}
        {quiz && quiz.length > 0 ? (
          <div className="flex flex-col gap-6">
            {quiz.map((item, index) => {
              const isCorrectAnswer = (answersRef.current[index]?.toLowerCase() || '') === (item.correctAnswer?.toLowerCase() || '');
              
              return (
                <div
                  key={index}
                  className="backdrop-blur-xl bg-[#090d23]/40 border border-white/5 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-white/10 transition-all duration-300"
                >
                  <p className="text-gray-200 text-lg font-light leading-relaxed md:w-7/12">
                    <span className="font-mono text-cyan-500 font-semibold mr-2">{index + 1}.</span>
                    {item.question}
                  </p>
                  <div className="shrink-0 w-full md:w-auto">
                    {showAnswers ? (
                      <div className={`px-4 py-3 rounded-xl border text-sm font-semibold w-full md:w-56 text-center ${
                        isCorrectAnswer
                          ? "bg-green-500/20 border-green-500/60 text-green-300"
                          : "bg-red-500/10 border-red-500/40 text-red-300 flex flex-col gap-1"
                      }`}>
                        <span>Your: "{answersRef.current[index] || '(Empty)'}"</span>
                        {!isCorrectAnswer && (
                          <span className="text-xs text-green-400 font-bold block mt-1">Correct: "{item.correctAnswer}"</span>
                        )}
                      </div>
                    ) : (
                      <input
                        type="text"
                        disabled={isSubmit}
                        placeholder="Type missing word..."
                        className="w-full md:w-56 bg-[#050713]/60 border border-white/10 focus:border-cyan-500/80 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all font-Lato text-center"
                        onChange={(e) => handleInputChange(e.target.value, index)}
                        ref={(el) => (inputRefs.current[index] = el)}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="backdrop-blur-xl bg-[#090d23]/40 border border-white/5 p-12 rounded-3xl text-center">
            <p className="text-gray-400 font-light">No blank questions available.</p>
          </div>
        )}

        {/* Submit Bar */}
        {!showAnswers && (
          <div className="mt-12 flex justify-center">
            <button
              onClick={handleSubmit}
              disabled={answeredCount < quiz.length}
              className={`px-8 py-4 font-semibold text-lg rounded-2xl font-Fredoka text-white shadow-lg transition-all duration-300 ${
                answeredCount < quiz.length
                  ? "bg-slate-800 border border-slate-700 text-slate-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 shadow-cyan-500/10 hover:shadow-cyan-400/20 hover:scale-[1.02] active:scale-[0.98]"
              }`}
            >
              Submit Quiz
            </button>
          </div>
        )}

        {/* post-evaluation review states options */}
        {showAnswers && (
          <div className="mt-12 flex gap-4 justify-center">
            <button
              onClick={handleTryAgain}
              className="flex items-center gap-2 px-6 py-3 border border-white/10 hover:border-white/20 bg-white/5 rounded-xl text-sm font-semibold hover:bg-white/10 active:scale-95 transition-all font-Fredoka"
            >
              <RotateCcw className="w-4 h-4" />
              Try Again
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-white rounded-xl text-sm font-semibold shadow-md active:scale-95 transition-all font-Fredoka"
            >
              <Home className="w-4 h-4" />
              Dashboard
            </button>
          </div>
        )}
      </div>

      {/* Glassmorphic Scratchcard score modal */}
      <ScoreModal
        score={score}
        total={quiz.length}
        isVisible={isSubmit}
        onSeeAnswers={handleShowAnswers}
        onTryAgain={handleTryAgain}
        feedback={feedback}
        quizId={quizId}
      />
    </div>
  );
};

export default Blanks;
