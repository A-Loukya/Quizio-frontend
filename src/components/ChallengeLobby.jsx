import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Trophy, Play, Loader2, Sparkles, Brain, Clock, Award } from 'lucide-react';
import { API_BASE_URL } from '../config';

const ChallengeLobby = () => {
  const { lobbyCode } = useParams();
  const navigate = useNavigate();
  const [lobbyData, setLobbyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [nickname, setNickname] = useState('');

  useEffect(() => {
    const fetchLobby = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/lobbies/${lobbyCode}`);
        if (!response.ok) {
          throw new Error('Lobby not found or server error');
        }
        const data = await response.json();
        setLobbyData(data);
      } catch (err) {
        console.error('Fetch Lobby Error:', err);
        setError('Challenge Lobby not found. Double-check your code.');
      } finally {
        setLoading(false);
      }
    };
    fetchLobby();
  }, [lobbyCode]);

  const handleStartChallenge = (e) => {
    e.preventDefault();
    if (!nickname.trim()) {
      alert('Please enter a nickname to start the challenge.');
      return;
    }
    // Navigate to challenge play page and pass nickname in routing state
    navigate(`/challenge/${lobbyCode}/play`, {
      state: { nickname: nickname.trim() }
    });
  };

  const formatTime = (seconds) => {
    if (seconds === undefined || seconds === null) return '0s';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#060814] text-white flex flex-col justify-center items-center font-Lato">
        <Loader2 className="w-10 h-10 text-cyan-400 animate-spin mb-4" />
        <p className="text-gray-400">Loading challenge lobby...</p>
      </div>
    );
  }

  if (error || !lobbyData) {
    return (
      <div className="min-h-screen bg-[#060814] text-white flex flex-col justify-center items-center font-Lato p-6">
        <div className="backdrop-blur-xl bg-[#0c0e22]/90 border border-red-500/20 p-8 rounded-3xl text-center max-w-sm shadow-2xl">
          <h2 className="text-2xl font-bold font-Fredoka text-red-400 mb-4">Error</h2>
          <p className="text-gray-300 font-light mb-6 text-sm">{error || 'Lobby invalid.'}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl font-semibold font-Fredoka transition-colors cursor-pointer"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#060814] text-white overflow-hidden pb-16 font-Lato pt-16 flex flex-col items-center justify-center p-6">
      {/* Background radial glow spots */}
      <div className="absolute top-1/4 left-[-10%] w-[450px] h-[450px] bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-[-10%] w-[450px] h-[450px] bg-indigo-600/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Simplified Capsule Brand Logo Header */}
      <div className="mb-8 flex items-center gap-2 px-4 py-2 rounded-full border border-white/5 bg-white/[0.02] backdrop-blur-xl animate-fade-in select-none">
        <Trophy className="w-5 h-5 text-yellow-400 animate-bounce" />
        <span className="text-lg font-Fredoka font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400">
          Quizio Challenge Arena
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full max-w-4xl z-10">
        
        {/* Left Column: Challenge Details & Nickname Entry */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="backdrop-blur-xl bg-[#0c0e22]/80 border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col gap-5 text-left relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-[30px]" />
            
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[10px] font-bold uppercase tracking-wider mb-4">
                <Sparkles className="w-3 h-3 text-purple-300" />
                Active Multiplayer Lobby
              </span>
              <h2 className="text-2xl font-bold font-Fredoka text-white leading-tight">
                You've Been Challenged!
              </h2>
              <p className="text-xs text-gray-400 mt-1 font-light leading-relaxed">
                Hosted by <span className="text-indigo-300 font-medium">@{lobbyData.host}</span>
              </p>
            </div>

            <div className="border border-white/5 bg-white/[0.01] p-4.5 rounded-2xl flex flex-col gap-3">
              <div>
                <span className="text-[10px] text-gray-500 uppercase tracking-wider block font-Fredoka">Topic</span>
                <span className="text-sm font-semibold font-Fredoka text-white block mt-0.5">{lobbyData.topic}</span>
              </div>
              <div className="flex gap-4">
                <div>
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider block font-Fredoka">Format</span>
                  <span className="text-xs font-semibold text-cyan-400 uppercase block mt-0.5">{lobbyData.quizType}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider block font-Fredoka">Questions</span>
                  <span className="text-xs font-semibold text-white block mt-0.5">{lobbyData.questions.length} items</span>
                </div>
              </div>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleStartChallenge} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-wider text-gray-400 font-bold block mb-1 font-Fredoka">Enter Nickname</label>
                <input
                  type="text"
                  maxLength={15}
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="e.g. CodeWizard..."
                  className="w-full px-4 py-3 bg-[#070914] border border-white/10 rounded-xl focus:outline-none focus:border-cyan-500 text-sm transition-colors text-white"
                  required
                />
              </div>
              
              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-white rounded-xl text-sm font-semibold hover:shadow-cyan-500/10 active:scale-[0.98] transition-all font-Fredoka flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                Start Challenge Room
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Lobby Leaderboard Rankings */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="backdrop-blur-xl bg-[#0c0e22]/80 border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col gap-5 text-left h-full">
            <div className="flex items-center gap-2 border-b border-white/5 pb-3">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <h3 className="text-xl font-bold font-Fredoka text-white">Lobby Leaderboard</h3>
            </div>

            {lobbyData.leaderboard.length > 0 ? (
              <div className="flex flex-col gap-3 overflow-y-auto no-scrollbar max-h-[400px]">
                {lobbyData.leaderboard.map((player, idx) => {
                  const place = idx + 1;
                  let rankStyles = "border-white/5 bg-white/[0.01]";
                  let awardIconColor = "text-gray-600";
                  
                  if (place === 1) {
                    rankStyles = "border-yellow-500/20 bg-yellow-500/5 text-yellow-300";
                    awardIconColor = "text-yellow-400";
                  } else if (place === 2) {
                    rankStyles = "border-slate-300/20 bg-slate-300/5 text-slate-300";
                    awardIconColor = "text-slate-300";
                  } else if (place === 3) {
                    rankStyles = "border-amber-600/20 bg-amber-600/5 text-amber-500";
                    awardIconColor = "text-amber-500";
                  }

                  return (
                    <div
                      key={player._id || idx}
                      className={`p-3.5 border rounded-xl flex items-center justify-between transition-all duration-300 ${rankStyles}`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {place <= 3 ? (
                          <Award className={`w-5 h-5 shrink-0 ${awardIconColor}`} />
                        ) : (
                          <span className="w-5 text-center text-xs font-bold text-gray-500">#{place}</span>
                        )}
                        <h5 className="text-sm font-bold font-Fredoka truncate pr-2 text-white" title={player.name}>
                          {player.name}
                        </h5>
                      </div>
                      
                      <div className="flex items-center gap-4 shrink-0 font-mono text-xs">
                        <span className="flex items-center gap-1 text-gray-400">
                          <Clock className="w-3 h-3 text-gray-500" />
                          {formatTime(player.timeTaken)}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-white/5 text-[11px] font-bold">
                          {player.score} / {player.totalQuestions}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
                <Brain className="w-10 h-10 text-gray-600 mb-3 animate-pulse" />
                <p className="text-gray-400 font-light text-xs">No entries yet. Be the first to play!</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ChallengeLobby;
