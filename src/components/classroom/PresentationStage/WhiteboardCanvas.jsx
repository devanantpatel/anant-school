import React, { useRef, useState, useEffect } from "react";
import { 
  PenTool, 
  Highlighter, 
  Eraser, 
  RotateCcw, 
  X 
} from "lucide-react";

export default function WhiteboardCanvas({ isActive, onClose }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState("pen");
  const [color, setColor] = useState("#ef4444");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const updateSize = () => {
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, [isActive]);

  const startDrawing = (e) => {
    if (!isActive) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing || !isActive) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    if (tool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineWidth = 22;
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = color;
      ctx.lineWidth = tool === "highlighter" ? 14 : 3;
      ctx.globalAlpha = tool === "highlighter" ? 0.35 : 1.0;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    }

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <>
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        className={`absolute inset-0 z-20 touch-none ${
          isActive ? "pointer-events-auto cursor-crosshair" : "pointer-events-none"
        }`}
      />

      {/* Mobile-Friendly Floating Pen Bar */}
      {isActive && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-30 max-w-[94%] bg-gray-900/95 backdrop-blur-md px-2.5 py-1.5 rounded-2xl border border-gray-700 shadow-2xl flex items-center gap-1.5 sm:gap-2 text-white">
          <button
            onClick={() => setTool("pen")}
            className={`p-1.5 rounded-xl transition ${
              tool === "pen" ? "bg-indigo-600 text-white" : "text-gray-400"
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setTool("highlighter")}
            className={`p-1.5 rounded-xl transition ${
              tool === "highlighter" ? "bg-indigo-600 text-white" : "text-gray-400"
            }`}
          >
            <Highlighter className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setTool("eraser")}
            className={`p-1.5 rounded-xl transition ${
              tool === "eraser" ? "bg-indigo-600 text-white" : "text-gray-400"
            }`}
          >
            <Eraser className="w-3.5 h-3.5" />
          </button>

          {/* Color palette */}
          <div className="flex items-center gap-1 px-1 border-x border-gray-700">
            {["#ef4444", "#3b82f6", "#eab308", "#10b981", "#ffffff"].map((c) => (
              <button
                key={c}
                onClick={() => {
                  setColor(c);
                  if (tool === "eraser") setTool("pen");
                }}
                className={`w-3.5 h-3.5 rounded-full border border-gray-600 transition ${
                  color === c && tool !== "eraser" ? "scale-125 ring-2 ring-white" : ""
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>

          <button
            onClick={clearCanvas}
            className="p-1.5 rounded-xl text-gray-400 hover:text-red-400 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onClose}
            className="p-1 rounded-xl bg-gray-800 text-gray-400 hover:text-white transition"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </>
  );
}