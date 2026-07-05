import React, { useState } from 'react';
import Header from './Header';
import ScoreModal from './ScoreModal';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, RotateCcw, Eye, Home } from 'lucide-react';
import { API_BASE_URL } from '../config';

const TF = ({ quiz, quizId }) => {
  const navigate = useNavigate();
  const [userAnswers, setUserAnswers] = useState([]); 
  const [isSubmit, setIsSubmit] = useState(false);
  const [score, setScore] = useState(0);
  const [showCorrectAnswers, setShowCorrectAnswers] = useState(false);
  // state managed by shared ScoreModal
  const [feedback, setFeedback] = useState(null);

  const handleOptionClick = (index, value) => {
    const updatedAnswers = [...userAnswers];
    updatedAnswers[index] = value; 
    setUserAnswers(updatedAnswers);
  };

  const handleSubmit = async () => {
    let calculatedScore = 0;

    quiz.forEach((item, index) => {
      if (item.correctAnswer.toLowerCase() === userAnswers[index]?.toLowerCase()) {
        calculatedScore++;
      }
    });

    setScore(calculatedScore);
    setIsSubmit(true);

    // Compile correctness array
    const correctness = quiz.map((item, index) => {
      return item.correctAnswer.toLowerCase() === userAnswers[index]?.toLowerCase();
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

  const handleSeeAnswers = () => {
    setShowCorrectAnswers(true); 
    setIsSubmit(false); 
  };

  const handleTryAgain = () => {
    setUserAnswers([]);
    setScore(0);
    setIsSubmit(false);
    setShowCorrectAnswers(false);
    setFeedback(null);
  };

  const answeredCount = userAnswers.filter((ans) => ans !== undefined).length;
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
              True or False Format
            </span>
            <h1 className="text-3xl font-bold font-Fredoka tracking-tight text-white">
              Quiz Challenge
            </h1>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-sm text-gray-400 mb-1">
              Progress: {answeredCount} of {quiz.length} Statements
            </span>
            <div className="w-48 bg-white/5 h-2 rounded-full overflow-hidden border border-white/5">
              <div
                style={{ width: `${progressPercent}%` }}
                className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-full rounded-full transition-all duration-300"
              />
            </div>
          </div>
        </div>

        {/* Statements List */}
        {quiz && quiz.length > 0 ? (
          <div className="flex flex-col gap-6">
            {quiz.map((item, index) => {
              const isSelectedTrue = userAnswers[index] === 'True';
              const isSelectedFalse = userAnswers[index] === 'False';

              // Evaluation state colors
              let trueBtnStyle = "bg-white/5 border-white/5 text-gray-300 hover:bg-white/10";
              let falseBtnStyle = "bg-white/5 border-white/5 text-gray-300 hover:bg-white/10";

              if (showCorrectAnswers) {
                const isCorrectAnswerTrue = item.correctAnswer.toLowerCase() === 'true';
                if (isCorrectAnswerTrue) {
                  trueBtnStyle = "bg-green-500/20 border-green-500/60 text-green-300 shadow-md shadow-green-950/20";
                  if (isSelectedFalse) {
                    falseBtnStyle = "bg-red-500/20 border-red-500/60 text-red-300 shadow-md shadow-red-950/20";
                  }
                } else {
                  falseBtnStyle = "bg-green-500/20 border-green-500/60 text-green-300 shadow-md shadow-green-950/20";
                  if (isSelectedTrue) {
                    trueBtnStyle = "bg-red-500/20 border-red-500/60 text-red-300 shadow-md shadow-red-950/20";
                  }
                }
              } else {
                if (isSelectedTrue) {
                  trueBtnStyle = "bg-cyan-500/20 border-cyan-500/60 text-cyan-300 shadow-md shadow-cyan-950/20";
                }
                if (isSelectedFalse) {
                  falseBtnStyle = "bg-cyan-500/20 border-cyan-500/60 text-cyan-300 shadow-md shadow-cyan-950/20";
                }
              }

              return (
                <div
                  key={index}
                  className="backdrop-blur-xl bg-[#090d23]/40 border border-white/5 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-white/10 transition-all duration-300"
                >
                  <p className="text-gray-200 text-lg font-light leading-relaxed md:w-8/12">
                    <span className="font-mono text-cyan-500 font-semibold mr-2">{index + 1}.</span>
                    {item.question}
                  </p>
                  <div className="flex gap-3 shrink-0">
                    <button
                      className={`px-5 py-2.5 rounded-xl text-sm font-bold tracking-wider uppercase border transition-all duration-300 w-24 ${trueBtnStyle}`}
                      onClick={() => handleOptionClick(index, 'True')}
                      disabled={isSubmit || showCorrectAnswers}
                    >
                      True
                    </button>
                    <button
                      className={`px-5 py-2.5 rounded-xl text-sm font-bold tracking-wider uppercase border transition-all duration-300 w-24 ${falseBtnStyle}`}
                      onClick={() => handleOptionClick(index, 'False')}
                      disabled={isSubmit || showCorrectAnswers}
                    >
                      False
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="backdrop-blur-xl bg-[#090d23]/40 border border-white/5 p-12 rounded-3xl text-center">
            <p className="text-gray-400 font-light">No True/False questions available.</p>
          </div>
        )}

        {/* Submit Bar */}
        {!showCorrectAnswers && (
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
        {showCorrectAnswers && (
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

      <ScoreModal
        score={score}
        total={quiz.length}
        isVisible={isSubmit}
        onSeeAnswers={handleSeeAnswers}
        onTryAgain={handleTryAgain}
        feedback={feedback}
        quizId={quizId}
      />
    </div>
  );
};

export default TF;
