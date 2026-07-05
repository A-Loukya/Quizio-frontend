"use client";
import React from "react";
import { cn } from "@/lib/utils";
import AnimatedGridPattern from "./ui/animated-grid-pattern";
import Header from "./Header";
import CardStackPeek from "./Cards";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Brain, CheckCircle2 } from "lucide-react";

const Home = () => {
  return (
    <div className="relative min-h-screen bg-[#060814] text-white overflow-hidden pb-16 font-Lato">
      {/* Background radial glow spots */}
      <div className="absolute top-1/4 left-[-10%] w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[120px] animate-float-1 pointer-events-none" />
      <div className="absolute bottom-1/4 right-[-10%] w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[120px] animate-float-2 pointer-events-none" />

      <Header />

      <div className="relative max-w-6xl mx-auto px-6 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center min-h-[80vh] py-8 lg:py-16">
          {/* Left Column: Copywriting & Actions */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="lg:col-span-7 flex flex-col items-start text-left"
          >
            {/* Version Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold mb-6">
              <Brain className="w-3.5 h-3.5 text-cyan-300" />
              <span>Quizio v1.0 • AI-Powered Learning</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-Fredoka font-bold tracking-tight leading-[1.1] mb-6">
              Learn Your Way,{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400">
                Instantly.
              </span>
            </h1>

            {/* Description Subtitle */}
            <p className="text-gray-400 text-lg sm:text-xl font-light mb-8 max-w-xl leading-relaxed">
              Explore personalized quizzes on any topic! Enter your topic, select your format, and let Gemini AI synthesize custom quizzes tailored just for you.
            </p>

            {/* Action Call-to-action */}
            <div className="mb-10 w-full sm:w-auto">
              <Link to="/login" className="no-underline">
                <button className="relative w-full sm:w-auto px-8 py-4 font-semibold text-lg rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-white shadow-lg shadow-cyan-500/10 hover:shadow-cyan-400/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 font-Fredoka flex items-center justify-center gap-2 group">
                  Try Quizio Free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </button>
              </Link>
            </div>

            {/* Mini Features List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg w-full">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300">
                  <CheckCircle2 className="w-4.5 h-4.5" />
                </div>
                <span className="text-sm font-medium text-gray-300 font-Fredoka">Synthesized in seconds</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300">
                  <CheckCircle2 className="w-4.5 h-4.5" />
                </div>
                <span className="text-sm font-medium text-gray-300 font-Fredoka">Active recall flashcards</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300">
                  <CheckCircle2 className="w-4.5 h-4.5" />
                </div>
                <span className="text-sm font-medium text-gray-300 font-Fredoka">True/False statements</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300">
                  <CheckCircle2 className="w-4.5 h-4.5" />
                </div>
                <span className="text-sm font-medium text-gray-300 font-Fredoka">Scratch card reveals</span>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Interactive Card Preview */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="lg:col-span-5 flex justify-center relative w-full lg:mt-0 mt-8"
          >
            {/* Custom card stack frame glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/5 to-indigo-500/5 rounded-3xl blur-2xl -z-10" />
            <div className="w-full max-w-[400px]">
              <CardStackPeek />
            </div>
          </motion.div>
        </div>
      </div>

      <AnimatedGridPattern
        numSquares={15}
        maxOpacity={0.06}
        duration={3}
        repeatDelay={1}
        className={cn("absolute inset-0 pointer-events-none opacity-40")}
      />
    </div>
  );
};

export default Home;
