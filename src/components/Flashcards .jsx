import React, { useState } from 'react';
import Header from './Header';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCcw, Home, CheckCircle } from 'lucide-react';
import { API_BASE_URL } from '../config';

const Flashcards = ({ quiz, quizId }) => {
  const navigate = useNavigate();
  const [flipped, setFlipped] = useState(Array(quiz ? quiz.length : 0).fill(false)); 
  const [reviewed, setReviewed] = useState({}); // Track which cards have been clicked/reviewed
  const [completed, setCompleted] = useState(false);

  const handleFlip = (index) => {
    const newFlipped = [...flipped]; 
    newFlipped[index] = !newFlipped[index]; 
    setFlipped(newFlipped); 

    // Mark as reviewed
    setReviewed((prev) => ({
      ...prev,
      [index]: true,
    }));
  };

  const handleFinish = async () => {
    setCompleted(true);

    // Log study completion in backend if quizId is available
    if (quizId) {
      const token = localStorage.getItem('token');
      try {
        await fetch(`${API_BASE_URL}/api/quizzes/attempt`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            quizId,
            score: quiz.length, // Flashcards review scores 100% on completion
            totalQuestions: quiz.length
          })
        });
      } catch (err) {
        console.error('Error logging flashcard attempt:', err);
      }
    }
  };

  const handleReset = () => {
    setFlipped(Array(quiz ? quiz.length : 0).fill(false));
    setReviewed({});
    setCompleted(false);
  };

  const reviewedCount = Object.keys(reviewed).length;
  const progressPercent = quiz ? (reviewedCount / quiz.length) * 100 : 0;

  return (
    <div className="relative min-h-screen bg-[#060814] text-white overflow-hidden pb-20 font-Lato">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-[-10%] w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-[-10%] w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none" />

      <Header />

      <div className="relative max-w-5xl mx-auto px-6 z-10 pt-6">
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
              Active Recall Mode
            </span>
            <h1 className="text-3xl font-bold font-Fredoka tracking-tight text-white">
              Flashcard Review
            </h1>
          </div>
          {quiz && (
            <div className="flex flex-col items-end">
              <span className="text-sm text-gray-400 mb-1">
                Reviewed: {reviewedCount} of {quiz.length} Cards
              </span>
              <div className="w-48 bg-white/5 h-2 rounded-full overflow-hidden border border-white/5">
                <div
                  style={{ width: `${progressPercent}%` }}
                  className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-full rounded-full transition-all duration-300"
                />
              </div>
            </div>
          )}
        </div>

        {/* Flashcards Grid */}
        {quiz && quiz.length > 0 ? (
          <div className="flex justify-center flex-wrap gap-8 mt-10">
            {quiz.map((item, index) => (
              <div
                key={index}
                style={{ perspective: '1000px' }}
                className="w-full max-w-[340px] h-[240px] cursor-pointer"
                onClick={() => handleFlip(index)}
              >
                <div
                  style={{
                    transformStyle: 'preserve-3d',
                    transform: flipped[index] ? 'rotateY(180deg)' : 'rotateY(0deg)',
                    transition: 'transform 0.6s ease-in-out',
                  }}
                  className="relative w-full h-full text-center"
                >
                  {/* Front Side */}
                  <div
                    style={{
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                    }}
                    className="absolute inset-0 bg-[#090d23]/80 border border-white/10 rounded-2xl p-6 flex flex-col justify-between items-center shadow-lg"
                  >
                    <span className="text-[10px] uppercase tracking-wider text-cyan-400 font-semibold font-Fredoka">
                      Question / Front
                    </span>
                    <p className="text-center font-mono text-base text-gray-200 leading-relaxed font-light px-2 my-auto">
                      {item.question}
                    </p>
                    <span className="text-[9px] text-white/20 font-mono tracking-wider">
                      CLICK TO FLIP
                    </span>
                  </div>

                  {/* Back Side */}
                  <div
                    style={{
                      transform: 'rotateY(180deg)',
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                    }}
                    className="absolute inset-0 bg-indigo-950/40 border border-indigo-500/30 rounded-2xl p-6 flex flex-col justify-between items-center shadow-lg"
                  >
                    <span className="text-[10px] uppercase tracking-wider text-indigo-400 font-semibold font-Fredoka">
                      Answer / Back
                    </span>
                    <p className="text-center text-base text-indigo-100 font-Lato px-2 my-auto leading-relaxed">
                      {item.correctAnswer}
                    </p>
                    <span className="text-[9px] text-indigo-500/40 font-mono tracking-wider">
                      CLICK TO FLIP
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="backdrop-blur-xl bg-[#090d23]/40 border border-white/5 p-12 rounded-3xl text-center">
            <p className="text-gray-400 font-light">No flashcards available.</p>
          </div>
        )}

        {/* Finish Button */}
        {quiz && quiz.length > 0 && !completed && (
          <div className="mt-16 flex justify-center">
            <button
              onClick={handleFinish}
              className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 font-semibold text-lg rounded-2xl font-Fredoka text-white shadow-lg shadow-cyan-500/10 hover:shadow-cyan-400/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
            >
              Finish Study Review
            </button>
          </div>
        )}
      </div>

      {/* Glassmorphic Study Complete Overlay Modal */}
      {completed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-sm backdrop-blur-xl bg-[#0b0f24]/90 border border-white/10 rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-green-500/10 border border-green-500/20 text-green-400 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="w-10 h-10" />
            </div>
            
            <h3 className="text-2xl font-bold font-Fredoka text-white mb-2">
              Study Session Complete!
            </h3>
            <p className="text-sm text-gray-400 mb-8 font-light leading-relaxed">
              Well done! You reviewed all {quiz.length} recall cards. Spaced repetition study logs have been saved to your profile history.
            </p>

            <div className="flex gap-4 w-full justify-center">
              <button
                onClick={handleReset}
                className="flex items-center justify-center gap-2 flex-1 py-3 border border-white/10 hover:border-white/20 bg-white/5 rounded-xl text-sm font-semibold hover:bg-white/10 transition-colors font-Fredoka"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center justify-center gap-2 flex-1 py-3 bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-white rounded-xl text-sm font-semibold shadow-md active:scale-95 transition-all font-Fredoka"
              >
                <Home className="w-4 h-4" />
                Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Flashcards;
