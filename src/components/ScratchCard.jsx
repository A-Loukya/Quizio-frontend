import React, { useRef, useEffect, useState } from "react";

const ScratchCard = ({ score, total, onComplete }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [scratchedPercent, setScratchedPercent] = useState(0);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Support high pixel density (retina) screens
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Draw metallic gradient background
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, "#1e293b");
    grad.addColorStop(0.3, "#475569");
    grad.addColorStop(0.5, "#64748b");
    grad.addColorStop(0.7, "#475569");
    grad.addColorStop(1, "#1e293b");

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add overlay pattern text instruction
    ctx.font = "bold 14px Fredoka";
    ctx.fillStyle = "#cbd5e1";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("SCRATCH HERE TO REVEAL SCORE", canvas.width / 2, canvas.height / 2);
  }, []);

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    // Support both Touch and Mouse coordinates
    if (e.touches && e.touches[0]) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (e) => {
    setIsDrawing(true);
    scratch(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    checkScratchPercentage();
  };

  const scratch = (e) => {
    if (!isDrawing || revealed) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCoordinates(e);

    // Use destination-out to erase pixels
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI * 2);
    ctx.fill();
  };

  const checkScratchPercentage = () => {
    if (revealed) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Get pixel color data
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imgData.data;
    let transparentCount = 0;

    // Check alpha values of pixels
    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] === 0) {
        transparentCount++;
      }
    }

    const totalPixels = canvas.width * canvas.height;
    const percent = Math.round((transparentCount / totalPixels) * 100);
    setScratchedPercent(percent);

    if (percent >= 45) {
      setRevealed(true);
      // Fade out canvas completely
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (onComplete) onComplete();
    }
  };

  return (
    <div className="relative w-full max-w-[280px] h-[130px] rounded-2xl overflow-hidden border border-white/10 bg-slate-900 shadow-2xl flex items-center justify-center select-none mx-auto">
      {/* Background Revealed Score Layer */}
      <div className="absolute inset-0 flex flex-col justify-center items-center bg-[#070914] z-0">
        <span className="text-[10px] uppercase tracking-wider text-cyan-400 font-semibold mb-1 font-Fredoka">
          Final Result
        </span>
        <h2 className="text-3xl font-extrabold font-Fredoka bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-400">
          {score} / {total}
        </h2>
        <span className="text-[10px] text-gray-500 font-mono mt-1">
          {Math.round((score / total) * 100)}% Accuracy
        </span>
      </div>

      {/* Foreground Canvas Scratch Layer */}
      {!revealed && (
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={scratch}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={scratch}
          onTouchEnd={stopDrawing}
          className="absolute inset-0 w-full h-full z-10 cursor-pointer touch-none transition-opacity duration-500"
        />
      )}
    </div>
  );
};

export default ScratchCard;
