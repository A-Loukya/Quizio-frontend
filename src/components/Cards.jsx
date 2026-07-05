"use client";
import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft } from "lucide-react";

const cards = [
  {
    id: 1,
    type: "mcq",
    title: "Multiple Choice Question",
    question: "Does Quizio only let you learn in MCQs?",
    options: ["Yes", "Nope, it’s versatile!", "Only T/F", "Just Flashcards"],
    correctAnswer: 1,
  },
  {
    id: 2,
    type: "blank",
    title: "Fill in the Blank",
    question: "With Quizio, learning is always ___!",
    correctAnswer: "fun",
  },
  {
    id: 3,
    type: "tf",
    title: "True/False",
    question: "Quizio lets you scratch to reveal your score!",
    correctAnswer: true,
  },
  {
    id: 4,
    type: "flashcard",
    title: "Flashcard",
    question: "Can we pick a topic and generate quizzes in any format?",
    answer: "Absolutely!",
  },
];

export default function CardStackPeek() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});

  const nextCard = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % cards.length);
  }, []);

  const prevCard = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + cards.length) % cards.length);
  }, []);

  const handleAnswer = (cardId, answer) => {
    setAnswers((prev) => ({ ...prev, [cardId]: answer }));
  };

  const getRelativeIndex = (index, current, total) => {
    let diff = index - current;
    while (diff > total / 2) diff -= total;
    while (diff <= -total / 2) diff += total;
    return diff;
  };

  return (
    <div className="w-full relative z-10 select-none font-Lato">
      {/* Outer wrapper with visible overflow for left/right cards */}
      <div className="relative w-full max-w-[320px] mx-auto h-[450px] flex items-center justify-center">
        <AnimatePresence initial={false}>
          {cards.map((card, index) => {
            const relIndex = getRelativeIndex(index, currentIndex, cards.length);
            const isCenter = relIndex === 0;
            const isRight = relIndex === 1;
            const isLeft = relIndex === -1;
            
            // Only show visible cards: center, left and right
            if (Math.abs(relIndex) > 1) return null;

            return (
              <motion.div
                key={card.id}
                style={{
                  zIndex: isCenter ? 10 : 5,
                  pointerEvents: "auto",
                }}
                animate={{
                  x: relIndex * 260, // Shift left/right card by 260px
                  scale: isCenter ? 1 : 0.82,
                  opacity: isCenter ? 1 : 0.35,
                  filter: isCenter ? "blur(0px)" : "blur(3px)",
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                }}
                onClick={() => {
                  if (isLeft) prevCard();
                  if (isRight) nextCard();
                }}
                className={`absolute w-full max-w-[320px] ${
                  isCenter ? "cursor-default" : "cursor-pointer hover:opacity-50"
                }`}
              >
                <div className="w-full h-[410px] backdrop-blur-xl bg-[#090d23]/85 border border-white/10 rounded-3xl shadow-2xl p-6 flex flex-col justify-between select-text animate-none">
                  <div className="flex flex-col items-center">
                    {/* Header */}
                    <span className="text-lg md:text-xl uppercase tracking-wider text-cyan-400 font-bold mb-4 font-Fredoka text-center block">
                      {card.title}
                    </span>

                    {/* Question Content */}
                    {card.type === "mcq" && (
                      <div className="w-full flex flex-col items-center mt-4">
                        <p className="mb-6 text-center text-base text-gray-200 font-Lato font-light leading-relaxed">
                          {card.question}
                        </p>
                        <div className="w-full flex flex-col gap-2">
                          {card.options.map((option, optionIndex) => {
                            const isSelected = answers[card.id] === optionIndex;
                            const isCorrect = isSelected && optionIndex === card.correctAnswer;
                            const isWrong = isSelected && optionIndex !== card.correctAnswer;

                            return (
                              <button
                                key={optionIndex}
                                disabled={!isCenter}
                                onClick={() => handleAnswer(card.id, optionIndex)}
                                className={`w-full px-4 py-2.5 text-center text-sm font-semibold rounded-xl border transition-all duration-300 ${
                                  isCorrect
                                    ? "bg-green-500/20 border-green-500/60 text-green-300 shadow-md shadow-green-950/20"
                                    : isWrong
                                    ? "bg-red-500/20 border-red-500/60 text-red-300 shadow-md shadow-red-950/20"
                                    : "bg-white/5 border-white/5 text-gray-300 hover:bg-white/10 hover:border-white/10"
                                }`}
                              >
                                {option}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {card.type === "blank" && (
                      <div className="w-full flex flex-col items-center mt-6">
                        <p className="mb-6 text-center text-base text-gray-200 font-Lato font-light leading-relaxed">
                          {card.question}
                        </p>
                        <input
                          type="text"
                          disabled={!isCenter}
                          className="w-full bg-[#050713]/60 border border-white/10 focus:border-cyan-500/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all font-Lato text-center"
                          onChange={(e) => handleAnswer(card.id, e.target.value)}
                          placeholder="Type answer..."
                        />
                        {answers[card.id] && (
                          <p
                            className={`text-center text-sm font-bold font-Fredoka mt-6 tracking-wide uppercase ${
                              answers[card.id].toLowerCase() === card.correctAnswer.toLowerCase()
                                ? "text-green-400"
                                : "text-red-400"
                            }`}
                          >
                            {answers[card.id].toLowerCase() === card.correctAnswer.toLowerCase()
                              ? "✓ Correct!"
                              : `✗ Correct: ${card.correctAnswer}`}
                          </p>
                        )}
                      </div>
                    )}

                    {card.type === "tf" && (
                      <div className="w-full flex flex-col items-center mt-8">
                        <p className="mb-8 text-center text-base text-gray-200 font-Lato font-light leading-relaxed">
                          {card.question}
                        </p>
                        <div className="flex gap-4 w-full justify-center">
                          <button
                            disabled={!isCenter}
                            onClick={() => handleAnswer(card.id, true)}
                            className={`px-6 py-2.5 rounded-xl text-sm font-bold tracking-wider uppercase border transition-all duration-300 w-24 ${
                              answers[card.id] === true
                                ? card.correctAnswer === true
                                  ? "bg-green-500/20 border-green-500/60 text-green-300 shadow-md"
                                  : "bg-red-500/20 border-red-500/60 text-red-300 shadow-md"
                                : "bg-white/5 border-white/5 text-gray-300 hover:bg-white/10"
                            }`}
                          >
                            True
                          </button>
                          <button
                            disabled={!isCenter}
                            onClick={() => handleAnswer(card.id, false)}
                            className={`px-6 py-2.5 rounded-xl text-sm font-bold tracking-wider uppercase border transition-all duration-300 w-24 ${
                              answers[card.id] === false
                                ? card.correctAnswer === false
                                  ? "bg-green-500/20 border-green-500/60 text-green-300 shadow-md"
                                  : "bg-red-500/20 border-red-500/60 text-red-300 shadow-md"
                                : "bg-white/5 border-white/5 text-gray-300 hover:bg-white/10"
                            }`}
                          >
                            False
                          </button>
                        </div>
                      </div>
                    )}

                    {card.type === "flashcard" && (
                      <div className="w-full flex flex-col items-center mt-6">
                        <div
                          style={{ perspective: "1000px" }}
                          className="w-[240px] h-[160px] cursor-pointer"
                          onClick={() => {
                            if (!isCenter) return;
                            handleAnswer(
                              card.id,
                              answers[card.id] === "answer" ? "question" : "answer"
                            );
                          }}
                        >
                          <div
                            style={{
                              transformStyle: "preserve-3d",
                              transform: answers[card.id] === "answer" ? "rotateY(180deg)" : "rotateY(0deg)",
                              transition: "transform 0.6s ease-in-out",
                            }}
                            className="relative w-full h-full text-center font-Lato font-light leading-relaxed"
                          >
                            {/* Front */}
                            <div
                              style={{
                                backfaceVisibility: "hidden",
                                WebkitBackfaceVisibility: "hidden",
                              }}
                              className="absolute inset-0 bg-[#050713]/60 border border-white/10 rounded-2xl p-4 flex flex-col justify-center items-center shadow-lg"
                            >
                              <span className="text-xs uppercase tracking-wider text-cyan-400 font-semibold mb-2 font-Fredoka">Front</span>
                              <p className="text-sm text-gray-200 leading-relaxed">{card.question}</p>
                              <span className="text-[10px] text-white/20 mt-4 font-mono">CLICK TO FLIP</span>
                            </div>
                            {/* Back */}
                            <div
                              style={{
                                transform: "rotateY(180deg)",
                                backfaceVisibility: "hidden",
                                WebkitBackfaceVisibility: "hidden",
                              }}
                              className="absolute inset-0 bg-indigo-950/40 border border-indigo-500/30 rounded-2xl p-4 flex flex-col justify-center items-center shadow-lg animate-none"
                            >
                              <span className="text-xs uppercase tracking-wider text-indigo-400 font-semibold mb-2 font-Fredoka">Back</span>
                              <p className="text-sm text-indigo-200 leading-relaxed">{card.answer}</p>
                              <span className="text-[10px] text-indigo-500/40 mt-4 font-mono">CLICK TO FLIP</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Hints / Help */}
                  {isCenter && (
                    <p className="text-xs text-center text-white/30 tracking-wider font-mono">
                      DEMO QUESTION {card.id}/{cards.length}
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Floating Side Arrow Navigation Buttons */}
        <button
          onClick={prevCard}
          className="absolute left-[-20px] md:left-[-60px] top-1/2 -translate-y-1/2 z-40 bg-[#090d23]/80 backdrop-blur-md border border-white/10 hover:border-cyan-500/30 hover:scale-110 active:scale-95 text-white transition-all rounded-full p-2 h-10 w-10 flex items-center justify-center cursor-pointer shadow-lg hover:shadow-cyan-500/10"
        >
          <ChevronLeft className="h-5 w-5 pointer-events-none" />
        </button>
        <button
          onClick={nextCard}
          className="absolute right-[-20px] md:right-[-60px] top-1/2 -translate-y-1/2 z-40 bg-[#090d23]/80 backdrop-blur-md border border-white/10 hover:border-cyan-500/30 hover:scale-110 active:scale-95 text-white transition-all rounded-full p-2 h-10 w-10 flex items-center justify-center cursor-pointer shadow-lg hover:shadow-cyan-500/10"
        >
          <ChevronRight className="h-5 w-5 pointer-events-none" />
        </button>
      </div>
    </div>
  );
}
