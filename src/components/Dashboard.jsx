import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import Header from "./Header";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, FileText, HelpCircle, CheckSquare, Layers, ArrowRight, Loader2, Cpu, AlertCircle, Clock, BookOpen, X, Brain, Share2, Trophy } from "lucide-react";
import { API_BASE_URL } from "../config";

const Dashboard = () => {
  const { user } = useAuth();
  const [selectedInput, setSelectedInput] = useState("text");
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("generate"); // "generate" or "history"
  const [history, setHistory] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [stats, setStats] = useState({ totalGenerated: 0, totalPlayed: 0, averageAccuracy: 0 });
  const [selectedAttempt, setSelectedAttempt] = useState(null);
  const [loadingLobbyId, setLoadingLobbyId] = useState(null);
  const [copiedLobbyId, setCopiedLobbyId] = useState(null);
  const [hostedLobbies, setHostedLobbies] = useState([]);
  const navigate = useNavigate();

  const handleChallengeFriends = async (quizId) => {
    if (!quizId) return;
    setLoadingLobbyId(quizId);
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
        setCopiedLobbyId(quizId);
        fetchHostedLobbies(); // Refresh lobbies list automatically!
        setTimeout(() => setCopiedLobbyId(null), 3000);
      } else {
        alert('Failed to generate challenge link. Please try again.');
      }
    } catch (err) {
      console.error('Error creating challenge lobby:', err);
      alert('Failed to connect to the server.');
    } finally {
      setLoadingLobbyId(null);
    }
  };

  const fetchHistory = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/quizzes/history`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setHistory(data.quizzes || []);
        setAttempts(data.attempts || []);
      }
    } catch (err) {
      console.error("Error fetching history:", err);
    }
  };

  const fetchStats = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/quizzes/stats`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setStats({
          totalGenerated: data.totalGenerated || 0,
          totalPlayed: data.totalPlayed || 0,
          averageAccuracy: data.averageAccuracy || 0,
        });
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  const fetchHostedLobbies = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/lobbies/user/all`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setHostedLobbies(data.lobbies || []);
      }
    } catch (err) {
      console.error("Error fetching hosted lobbies:", err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchHistory();
      fetchStats();
      fetchHostedLobbies();
    }
  }, [user]);

  if (!user) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-[#060814] text-white flex items-center justify-center">
          <div className="backdrop-blur-xl bg-[#090d23]/40 border border-white/10 p-8 rounded-2xl max-w-sm text-center shadow-xl">
            <h2 className="text-xl font-bold font-Fredoka mb-2">User not logged in</h2>
            <p className="text-sm text-gray-400 font-light mb-6">Please log in to access the Quizio console.</p>
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-xl text-xs font-semibold text-white hover:scale-105 active:scale-95 transition-all"
            >
              Go to Login
            </button>
          </div>
        </div>
      </>
    );
  }

  const handleInputClick = (type) => {
    setSelectedInput(type);
  };

  const handleQuizClick = (type) => {
    setSelectedQuiz(type);
  };

  const getLatestScore = (quizId) => {
    const latestAttempt = attempts.find(
      (attempt) => attempt.quizId && (attempt.quizId._id === quizId || attempt.quizId === quizId)
    );
    if (latestAttempt) {
      return `${latestAttempt.score}/${latestAttempt.totalQuestions}`;
    }
    return null;
  };

  // Generate quiz through the secure backend proxy endpoint
  const generateQuizFromAPI = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error("Authorization credentials missing. Please log in again.");
      }

      console.log(`[Dashboard] Initializing quiz generation via backend API...`);
      const response = await fetch(`${API_BASE_URL}/api/quizzes/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          topic: inputText,
          quizType: selectedQuiz
        })
      });

      if (!response.ok) {
        const errorDetails = await response.json().catch(() => ({}));
        throw new Error(errorDetails.message || "All backup Gemini models failed. Check backend log for details.");
      }

      const data = await response.json();
      console.log("[Dashboard] Quiz created successfully:", data);

      // Re-fetch database counts
      fetchHistory();
      fetchStats();

      // Navigate to play area passing quiz questions and the generated MongoDB ID
      navigate("/quiz", { 
        state: { 
          Data: JSON.stringify(data.quiz), 
          quizType: selectedQuiz,
          quizId: data.quizId
        } 
      });

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (selectedInput === "text" && !inputText) {
      alert("Please enter a subject topic for the quiz.");
      return;
    }
    if (!selectedQuiz) {
      alert("Please select a format model.");
      return;
    }

    generateQuizFromAPI();
  };

  return (
    <div className="relative min-h-screen bg-[#060814] text-white overflow-hidden pb-20 font-Lato">
      {/* Dynamic Background Glow Blobs */}
      <div className="absolute top-1/4 left-[10%] w-[350px] h-[350px] bg-cyan-500/5 rounded-full blur-[100px] animate-float-1 pointer-events-none" />
      <div className="absolute bottom-1/4 right-[10%] w-[400px] h-[400px] bg-violet-600/5 rounded-full blur-[120px] animate-float-2 pointer-events-none" />

      <Header />

      <div className="relative max-w-6xl mx-auto px-6 z-10">
        {/* Welcome Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mt-8 mb-10"
        >
          <h1 className="text-4xl md:text-5xl font-Fredoka font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400">
            Welcome, {user.name}
          </h1>
          <p className="text-gray-400 font-light mt-3 text-lg max-w-lg mx-auto leading-relaxed">
            Specify a topic, pick your format, and let AI synthesize custom questions in real-time.
          </p>
        </motion.div>

        {/* Real-time statistics aggregator dashboard */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
          <div className="backdrop-blur-xl bg-[#090d23]/40 border border-white/5 rounded-2xl p-5 flex items-center justify-between shadow-lg">
            <div>
              <span className="text-gray-400 text-[10px] uppercase tracking-wider font-bold block font-Fredoka">Quizzes Generated</span>
              <h3 className="text-2xl font-Fredoka font-bold text-cyan-400 mt-1">{stats.totalGenerated}</h3>
            </div>
            <div className="bg-cyan-500/10 text-cyan-300 p-2.5 rounded-xl">
              <Cpu className="w-5 h-5" />
            </div>
          </div>
          <div className="backdrop-blur-xl bg-[#090d23]/40 border border-white/5 rounded-2xl p-5 flex items-center justify-between shadow-lg">
            <div>
              <span className="text-gray-400 text-[10px] uppercase tracking-wider font-bold block font-Fredoka">Challenges Played</span>
              <h3 className="text-2xl font-Fredoka font-bold text-indigo-400 mt-1">{stats.totalPlayed}</h3>
            </div>
            <div className="bg-indigo-500/10 text-indigo-300 p-2.5 rounded-xl">
              <CheckSquare className="w-5 h-5" />
            </div>
          </div>
          <div className="backdrop-blur-xl bg-[#090d23]/40 border border-white/5 rounded-2xl p-5 flex items-center justify-between shadow-lg">
            <div>
              <span className="text-gray-400 text-[10px] uppercase tracking-wider font-bold block font-Fredoka">Average Accuracy</span>
              <h3 className="text-2xl font-Fredoka font-bold text-purple-400 mt-1">{stats.averageAccuracy}%</h3>
            </div>
            <div className="bg-purple-500/10 text-purple-300 p-2.5 rounded-xl">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-white/10 mb-8 w-fit gap-8">
          <button
            onClick={() => setActiveTab("generate")}
            className={`pb-3 text-sm font-semibold tracking-wide uppercase transition-colors relative font-Fredoka ${
              activeTab === "generate" ? "text-cyan-400 font-bold" : "text-gray-400 hover:text-white"
            }`}
          >
            Create Quiz
            {activeTab === "generate" && (
              <motion.div
                layoutId="activeTabUnderline"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 rounded-full"
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`pb-3 text-sm font-semibold tracking-wide uppercase transition-colors relative font-Fredoka ${
              activeTab === "history" ? "text-cyan-400 font-bold" : "text-gray-400 hover:text-white"
            }`}
          >
            Quiz History ({history.length})
            {activeTab === "history" && (
              <motion.div
                layoutId="activeTabUnderline"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 rounded-full"
              />
            )}
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "generate" ? (
            <motion.div
              key="generate"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="backdrop-blur-xl bg-[#090d23]/40 border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl"
            >
              {/* Step 1: Input Channel */}
              <div className="mb-10">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 text-sm font-mono font-bold">1</span>
                  <h2 className="text-lg font-Fredoka font-semibold tracking-wide uppercase text-white/90">Select Input Channel</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    type="button"
                    onClick={() => handleInputClick("text")}
                    className={`flex flex-col items-start p-5 rounded-2xl border text-left transition-all duration-300 ${
                      selectedInput === "text"
                        ? "bg-cyan-950/20 border-cyan-500/60 shadow-lg shadow-cyan-950/20"
                        : "bg-slate-950/20 border-white/5 hover:border-white/10 hover:bg-slate-900/10"
                    }`}
                  >
                    <div className={`p-3 rounded-xl mb-3 ${selectedInput === "text" ? "bg-cyan-500/20 text-cyan-300" : "bg-white/5 text-gray-400"}`}>
                      <FileText className="w-5 h-5" />
                    </div>
                    <h3 className="font-semibold text-white font-Fredoka">Topic Prompt</h3>
                    <p className="text-xs text-gray-400 mt-1">Generate questions from a word or sentence prompt.</p>
                  </button>

                  <div className="relative flex flex-col items-start p-5 rounded-2xl border bg-slate-950/10 border-white/5 opacity-50 cursor-not-allowed">
                    <span className="absolute top-3 right-3 text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/20">
                      Soon
                    </span>
                    <div className="p-3 rounded-xl mb-3 bg-white/5 text-gray-400">
                      <Cpu className="w-5 h-5" />
                    </div>
                    <h3 className="font-semibold text-white font-Fredoka">Slides Synthesis</h3>
                    <p className="text-xs text-gray-400 mt-1">Upload PDF, PPT, or Keynote presentations directly.</p>
                  </div>

                  <div className="relative flex flex-col items-start p-5 rounded-2xl border bg-slate-950/10 border-white/5 opacity-50 cursor-not-allowed">
                    <span className="absolute top-3 right-3 text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/20">
                      Soon
                    </span>
                    <div className="p-3 rounded-xl mb-3 bg-white/5 text-gray-400">
                      <Layers className="w-5 h-5" />
                    </div>
                    <h3 className="font-semibold text-white font-Fredoka">Snapshot Doc</h3>
                    <p className="text-xs text-gray-400 mt-1">Take a photo of a textbook page or notes to build quiz.</p>
                  </div>
                </div>
              </div>

              {/* Step 2: Subject Matter Input */}
              {selectedInput === "text" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mb-10 overflow-hidden"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 text-sm font-mono font-bold">2</span>
                    <h2 className="text-lg font-Fredoka font-semibold tracking-wide uppercase text-white/90">Specify Subject Matter</h2>
                  </div>
                  <div className="relative group">
                    <textarea
                      className="w-full bg-[#050713]/60 border border-white/10 group-hover:border-white/20 focus:border-cyan-500/80 focus:group-hover:border-cyan-500/80 rounded-2xl p-4 text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all duration-300 backdrop-blur-md resize-none font-Lato animate-none"
                      rows="2"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="e.g. React hooks lifecycle, Solar system history, JavaScript closures..."
                    />
                    <span className="absolute bottom-3 right-4 text-[10px] text-white/20 font-mono tracking-wider">
                      {inputText.length} CHARS
                    </span>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Quiz Format Selector */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 text-sm font-mono font-bold">3</span>
                  <h2 className="text-lg font-Fredoka font-semibold tracking-wide uppercase text-white/90">Choose Format</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => handleQuizClick("mcqs")}
                    className={`flex items-center p-4 rounded-2xl border text-left transition-all duration-300 ${
                      selectedQuiz === "mcqs"
                        ? "bg-cyan-950/20 border-cyan-500/60 shadow-lg shadow-cyan-950/20"
                        : "bg-slate-950/20 border-white/5 hover:border-white/10 hover:bg-slate-900/10"
                    }`}
                  >
                    <div className={`p-3 rounded-xl mr-4 ${selectedQuiz === "mcqs" ? "bg-cyan-500/20 text-cyan-300" : "bg-white/5 text-gray-400"}`}>
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white font-Fredoka">Multiple Choice</h3>
                      <p className="text-xs text-gray-400 mt-0.5">4 options, single correct letter</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuizClick("blanks")}
                    className={`flex items-center p-4 rounded-2xl border text-left transition-all duration-300 ${
                      selectedQuiz === "blanks"
                        ? "bg-cyan-950/20 border-cyan-500/60 shadow-lg shadow-cyan-950/20"
                        : "bg-slate-950/20 border-white/5 hover:border-white/10 hover:bg-slate-900/10"
                    }`}
                  >
                    <div className={`p-3 rounded-xl mr-4 ${selectedQuiz === "blanks" ? "bg-cyan-500/20 text-cyan-300" : "bg-white/5 text-gray-400"}`}>
                      <HelpCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white font-Fredoka">Fill in the Blanks</h3>
                      <p className="text-xs text-gray-400 mt-0.5">Sentences with missing keywords</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuizClick("T/F")}
                    className={`flex items-center p-4 rounded-2xl border text-left transition-all duration-300 ${
                      selectedQuiz === "T/F"
                        ? "bg-cyan-950/20 border-cyan-500/60 shadow-lg shadow-cyan-950/20"
                        : "bg-slate-950/20 border-white/5 hover:border-white/10 hover:bg-slate-900/10"
                    }`}
                  >
                    <div className={`p-3 rounded-xl mr-4 ${selectedQuiz === "T/F" ? "bg-cyan-500/20 text-cyan-300" : "bg-white/5 text-gray-400"}`}>
                      <CheckSquare className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white font-Fredoka">True or False</h3>
                      <p className="text-xs text-gray-400 mt-0.5">Determine statement validity</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuizClick("flashcards")}
                    className={`flex items-center p-4 rounded-2xl border text-left transition-all duration-300 ${
                      selectedQuiz === "flashcards"
                        ? "bg-cyan-950/20 border-cyan-500/60 shadow-lg shadow-cyan-950/20"
                        : "bg-slate-950/20 border-white/5 hover:border-white/10 hover:bg-slate-900/10"
                    }`}
                  >
                    <div className={`p-3 rounded-xl mr-4 ${selectedQuiz === "flashcards" ? "bg-cyan-500/20 text-cyan-300" : "bg-white/5 text-gray-400"}`}>
                      <Layers className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white font-Fredoka">Flashcards</h3>
                      <p className="text-xs text-gray-400 mt-0.5">Interactive recall cards</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Error Message Display */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="mt-4 p-4 rounded-xl border border-red-500/30 bg-red-950/10 text-red-400 text-sm flex items-start gap-3"
                  >
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold font-Fredoka">Quiz Generation Failed</h4>
                      <p className="text-xs text-red-300/80 mt-1 leading-relaxed">{error}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Step 4: Submit Actions */}
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className={`relative w-full sm:w-auto px-10 py-4 font-semibold text-base rounded-2xl transition-all duration-300 shadow-xl overflow-hidden font-Fredoka flex items-center justify-center gap-2 group ${
                    loading
                      ? "bg-slate-800 text-slate-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-cyan-500 to-indigo-500 text-white shadow-cyan-500/10 hover:shadow-cyan-500/30 hover:scale-[1.02] active:scale-[0.98]"
                  }`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin text-cyan-300" />
                      Synthesizing quiz...
                    </>
                  ) : (
                    <>
                      Generate Quiz
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              {/* History List Grid */}
              <div className="lg:col-span-8 flex flex-col gap-4">
                <h3 className="text-xl font-bold font-Fredoka flex items-center gap-2">
                  <Clock className="w-5 h-5 text-cyan-400" />
                  Your Generated Quizzes
                </h3>
                
                {history.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {history.map((quizItem) => (
                      <div
                        key={quizItem._id}
                        className="backdrop-blur-xl bg-[#090d23]/40 border border-white/5 p-5 rounded-2xl hover:border-cyan-500/20 transition-all duration-300 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex justify-between items-start mb-3">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-500/10 border border-cyan-500/20 text-cyan-300">
                              {quizItem.quizType === "mcqs" ? "Multiple Choice" : quizItem.quizType === "T/F" ? "True/False" : quizItem.quizType === "blanks" ? "Fill in Blanks" : "Flashcard"}
                            </span>
                            <span className="text-[10px] text-gray-500 font-mono">
                              {new Date(quizItem.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <h4 className="text-lg font-bold font-Fredoka text-white truncate pr-2" title={quizItem.topic}>
                            {quizItem.topic}
                          </h4>
                          <div className="flex justify-between items-center mt-2">
                            <p className="text-xs text-gray-400">Contains {quizItem.questions?.length || 5} questions</p>
                            {getLatestScore(quizItem._id) && (
                              <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
                                Latest: {getLatestScore(quizItem._id)}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="mt-6 flex gap-2.5 w-full">
                          <button
                            onClick={() =>
                              navigate("/quiz", { 
                                state: { 
                                  Data: JSON.stringify(quizItem.questions), 
                                  quizType: quizItem.quizType,
                                  quizId: quizItem._id
                                } 
                              })
                            }
                            className="flex-1 py-2.5 bg-cyan-950/20 border border-cyan-500/20 hover:border-cyan-500/40 hover:bg-cyan-950/50 text-cyan-300 hover:text-cyan-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] font-Fredoka cursor-pointer"
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                            Play Quiz
                          </button>
                          
                          <button
                            onClick={() => handleChallengeFriends(quizItem._id)}
                            disabled={loadingLobbyId === quizItem._id}
                            className="px-3.5 py-2.5 bg-gradient-to-r from-purple-900/40 via-indigo-900/40 to-cyan-950/40 border border-purple-500/20 hover:border-purple-500/40 text-purple-300 hover:text-purple-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] font-Fredoka cursor-pointer disabled:opacity-50"
                          >
                            {loadingLobbyId === quizItem._id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : copiedLobbyId === quizItem._id ? (
                              <span>✓ Copied!</span>
                            ) : (
                              <>
                                <Share2 className="w-3.5 h-3.5" />
                                Share
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="backdrop-blur-xl bg-[#090d23]/40 border border-white/5 rounded-3xl p-12 text-center flex flex-col items-center">
                    <BookOpen className="w-12 h-12 text-gray-600 mb-4" />
                    <p className="text-gray-400 font-light text-sm">No quizzes saved yet.</p>
                    <button
                      onClick={() => setActiveTab("generate")}
                      className="mt-4 px-5 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-xs font-semibold text-gray-300 hover:text-white transition-colors"
                    >
                      Generate Your First Quiz
                    </button>
                  </div>
                )}
              </div>

              {/* Performance Attempt Log & Shared Lobbies */}
              <div className="lg:col-span-4 flex flex-col gap-6">
                
                {/* Attempt Logs Box */}
                <div className="flex flex-col gap-3">
                  <div>
                    <h3 className="text-lg font-bold font-Fredoka flex items-center gap-2 text-white">
                      <CheckSquare className="w-4.5 h-4.5 text-indigo-400" />
                      Attempt Logs
                    </h3>
                    <p className="text-[10px] text-gray-500 font-light mt-0.5">
                      Click any log to view dynamic AI Coach insights and replay quiz.
                    </p>
                  </div>

                  {attempts.length > 0 ? (
                    <div className="backdrop-blur-xl bg-[#090d23]/40 border border-white/5 rounded-2xl p-4 max-h-[200px] overflow-y-auto no-scrollbar flex flex-col gap-2.5">
                      {attempts.map((attempt) => {
                        const percent = Math.round((attempt.score / attempt.totalQuestions) * 100);
                        let gradeColor = "text-red-400 bg-red-500/10 border-red-500/10";
                        if (percent >= 80) gradeColor = "text-green-400 bg-green-500/10 border-green-500/10";
                        else if (percent >= 50) gradeColor = "text-yellow-400 bg-yellow-500/10 border-yellow-500/10";

                        return (
                          <div
                            key={attempt._id}
                            className="group p-3 border border-white/5 hover:border-cyan-500/20 rounded-xl bg-white/[0.01] hover:bg-white/[0.03] flex items-center justify-between cursor-pointer transition-all duration-300"
                            onClick={() => setSelectedAttempt(attempt)}
                          >
                            <div className="min-w-0 pr-2">
                              <h5 className="text-xs font-bold font-Fredoka text-white group-hover:text-cyan-400 truncate transition-colors duration-300" title={attempt.quizId?.topic || "Unknown Quiz"}>
                                {attempt.quizId?.topic || "Challenge Quiz"}
                              </h5>
                              <span className="text-[9px] text-gray-500 block font-mono mt-0.5">
                                {new Date(attempt.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-2 shrink-0">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${gradeColor}`}>
                                {attempt.score}/{attempt.totalQuestions}
                              </span>
                              <Brain className="w-3.5 h-3.5 text-cyan-400/30 group-hover:text-cyan-400 group-hover:scale-110 transition-all duration-300" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="backdrop-blur-xl bg-[#090d23]/40 border border-white/5 rounded-2xl p-6 text-center flex flex-col items-center">
                      <Clock className="w-8 h-8 text-gray-600 mb-2" />
                      <p className="text-gray-500 font-light text-[11px]">No attempt logs recorded.</p>
                    </div>
                  )}
                </div>

                {/* Shared Lobbies Box */}
                <div className="flex flex-col gap-3">
                  <div>
                    <h3 className="text-lg font-bold font-Fredoka flex items-center gap-2 text-white">
                      <Trophy className="w-4.5 h-4.5 text-purple-400" />
                      Shared Challenges
                    </h3>
                    <p className="text-[10px] text-gray-500 font-light mt-0.5">
                      Open lobbies to track live score rankings of your friends.
                    </p>
                  </div>

                  {hostedLobbies.length > 0 ? (
                    <div className="backdrop-blur-xl bg-[#090d23]/40 border border-white/5 rounded-2xl p-4 max-h-[200px] overflow-y-auto no-scrollbar flex flex-col gap-2.5">
                      {hostedLobbies.map((lobby) => {
                        const lobbyUrl = `${window.location.origin}/challenge/${lobby.lobbyCode}`;
                        const isCopied = copiedLobbyId === lobby.quizId?._id;
                        return (
                          <div
                            key={lobby._id}
                            className="group p-3 border border-white/5 hover:border-cyan-500/20 rounded-xl bg-white/[0.01] hover:bg-white/[0.03] flex items-center justify-between transition-all duration-300"
                          >
                            <div 
                              className="min-w-0 pr-2 cursor-pointer flex-1"
                              onClick={() => window.open(lobbyUrl, '_blank')}
                              title="Click to view live leaderboard in new tab"
                            >
                              <h5 className="text-xs font-bold font-Fredoka text-white group-hover:text-cyan-400 truncate transition-colors duration-300">
                                {lobby.quizId?.topic || "Challenge Quiz"}
                              </h5>
                              <span className="text-[9px] text-gray-500 block font-mono mt-0.5">
                                Code: {lobby.lobbyCode} • {lobby.participants?.length || 0} players
                              </span>
                            </div>

                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(lobbyUrl);
                                setCopiedLobbyId(lobby.quizId?._id);
                                setTimeout(() => setCopiedLobbyId(null), 2500);
                              }}
                              className="p-1.5 bg-white/5 border border-white/10 hover:border-white/20 rounded-lg text-gray-400 hover:text-white transition-all shrink-0 cursor-pointer"
                              title="Copy Challenge Link"
                            >
                              {isCopied ? (
                                <span className="text-[9px] text-cyan-400 font-bold px-1">Copied</span>
                              ) : (
                                <Share2 className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="backdrop-blur-xl bg-[#090d23]/40 border border-white/5 rounded-2xl p-6 text-center flex flex-col items-center">
                      <Trophy className="w-8 h-8 text-gray-600 mb-2" />
                      <p className="text-gray-500 font-light text-[11px]">No active challenges. Click share on any quiz to start one!</p>
                    </div>
                  )}
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Attempt Details Modal */}
      {selectedAttempt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg backdrop-blur-xl bg-[#0b0f24]/90 border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col gap-4 text-left max-h-[90vh] overflow-y-auto no-scrollbar animate-fade-in">
            {/* Close Button */}
            <button
              onClick={() => setSelectedAttempt(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white hover:bg-white/10 rounded-full p-1.5 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header Details */}
            <div>
              <span className="text-[10px] uppercase tracking-wider text-cyan-400 font-bold block mb-1 font-Fredoka">
                Historical Attempt Review
              </span>
              <h3 className="text-xl font-bold font-Fredoka text-white truncate pr-6" title={selectedAttempt.quizId?.topic || "Challenge Quiz"}>
                {selectedAttempt.quizId?.topic || "Challenge Quiz"}
              </h3>
              <span className="text-[10px] text-gray-500 font-mono block mt-1">
                Completed on: {new Date(selectedAttempt.createdAt).toLocaleString()}
              </span>
            </div>

            {/* Performance Stats row */}
            <div className="grid grid-cols-2 gap-4 my-2">
              <div className="border border-white/5 bg-white/[0.01] p-3.5 rounded-xl text-center">
                <span className="text-[10px] uppercase text-gray-400 font-semibold font-Fredoka block">Final Score</span>
                <span className="text-xl font-Fredoka font-bold text-white mt-1 block">
                  {selectedAttempt.score} / {selectedAttempt.totalQuestions}
                </span>
              </div>
              <div className="border border-white/5 bg-white/[0.01] p-3.5 rounded-xl text-center">
                <span className="text-[10px] uppercase text-gray-400 font-semibold font-Fredoka block">Accuracy</span>
                <span className="text-xl font-Fredoka font-bold text-cyan-400 mt-1 block">
                  {Math.round((selectedAttempt.score / selectedAttempt.totalQuestions) * 100)}%
                </span>
              </div>
            </div>

            {/* AI Coach Insights block */}
            {selectedAttempt.feedback && (
              <div className="border border-white/5 bg-white/[0.02] p-5 rounded-2xl flex flex-col gap-3">
                <div className="flex items-center gap-2 text-cyan-400 border-b border-white/5 pb-2">
                  <Brain className="w-4.5 h-4.5 shrink-0 animate-pulse" />
                  <h4 className="text-xs font-bold uppercase tracking-wider font-Fredoka">AI Coach Insights</h4>
                </div>
                
                <p className="text-[13px] text-gray-200 font-light leading-relaxed">
                  {selectedAttempt.feedback.summary}
                </p>
                {selectedAttempt.feedback.weakAreas && selectedAttempt.feedback.weakAreas.toLowerCase() !== "none" && (
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-red-400 font-bold block mb-1 font-Fredoka">Focus Areas:</span>
                    <p className="text-[12px] text-gray-300 leading-relaxed font-light">
                      {selectedAttempt.feedback.weakAreas}
                    </p>
                  </div>
                )}
                {selectedAttempt.feedback.recommendations && (
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-green-400 font-bold block mb-1 font-Fredoka">Study Advice:</span>
                    <div className="text-[12px] text-gray-300 leading-relaxed font-light flex flex-col gap-1.5">
                      {Array.isArray(selectedAttempt.feedback.recommendations) ? (
                        selectedAttempt.feedback.recommendations.map((rec, rIdx) => (
                          <div key={rIdx} className="flex items-start gap-2">
                            <span className="text-green-400 shrink-0 mt-0.5">•</span>
                            <span>{rec}</span>
                          </div>
                        ))
                      ) : (
                        <p>{selectedAttempt.feedback.recommendations}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Challenge Friends Button */}
            {selectedAttempt.quizId?._id && (
              <button
                onClick={() => handleChallengeFriends(selectedAttempt.quizId._id)}
                disabled={loadingLobbyId === selectedAttempt.quizId._id}
                className="w-full py-3.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:via-indigo-500 hover:to-cyan-400 text-white rounded-xl text-xs font-semibold shadow-md hover:shadow-cyan-500/20 active:scale-[0.98] transition-all font-Fredoka flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 mt-2"
              >
                {loadingLobbyId === selectedAttempt.quizId._id ? (
                  <span>Generating Challenge Link...</span>
                ) : copiedLobbyId === selectedAttempt.quizId._id ? (
                  <span className="text-cyan-200">✓ Challenge Link Copied!</span>
                ) : (
                  <>
                    <Share2 className="w-4 h-4" />
                    Challenge Friends (Multiplayer)
                  </>
                )}
              </button>
            )}

            {/* Actions Row */}
            <div className="flex gap-3 mt-4">
              {selectedAttempt.quizId?.questions && (
                <button
                  onClick={() => {
                    setSelectedAttempt(null);
                    navigate("/quiz", {
                      state: {
                        Data: JSON.stringify(selectedAttempt.quizId.questions),
                        quizType: selectedAttempt.quizId.quizType,
                        quizId: selectedAttempt.quizId._id
                      }
                    });
                  }}
                  className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-white rounded-xl text-xs font-semibold shadow-md active:scale-95 transition-all font-Fredoka flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  Replay Quiz
                </button>
              )}
              <button
                onClick={() => setSelectedAttempt(null)}
                className="flex-1 py-3 border border-white/10 hover:border-white/20 bg-white/5 rounded-xl text-xs font-semibold hover:bg-white/10 transition-colors font-Fredoka cursor-pointer"
              >
                Close Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
