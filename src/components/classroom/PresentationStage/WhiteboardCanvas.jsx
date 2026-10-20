import React, { useRef, useState, useEffect } from "react";
import { PenTool, Highlighter, Eraser, RotateCcw, X } from "lucide-react";

export default function WhiteboardCanvas({ 
  isTeacher = false, 
  isActive = false, 
  onClose,
  roomChannel 
}) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState("pen");
  const [color, setColor] = useState("#ef4444");
  const lastPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const updateSize = () => {
      if (canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
      }
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  useEffect(() => {
    if (!roomChannel) return;

    const handleDrawEvent = ({ payload }) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");

      const x0 = payload.x0 * canvas.width;
      const y0 = payload.y0 * canvas.height;
      const x1 = payload.x1 * canvas.width;
      const y1 = payload.y1 * canvas.height;

      ctx.save();
      if (payload.tool === "eraser") {
        ctx.globalCompositeOperation = "destination-out";
        ctx.lineWidth = 26;
      } else {
        ctx.globalCompositeOperation = "source-over";
        ctx.strokeStyle = payload.color;
        ctx.lineWidth = payload.tool === "highlighter" ? 16 : 3.5;
        ctx.globalAlpha = payload.tool === "highlighter" ? 0.35 : 1.0;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
      }

      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.stroke();
      ctx.restore();
    };

    const handleClearEvent = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    roomChannel.on("broadcast", { event: "wb_stroke" }, handleDrawEvent);
    roomChannel.on("broadcast", { event: "wb_clear" }, handleClearEvent);
  }, [roomChannel]);

  const startDrawing = (e) => {
    if (!isTeacher || !isActive) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    lastPos.current = {
      x: (clientX - rect.left) / canvas.width,
      y: (clientY - rect.top) / canvas.height,
    };
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing || !isTeacher || !isActive) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const currentNormX = (clientX - rect.left) / canvas.width;
    const currentNormY = (clientY - rect.top) / canvas.height;

    const x0 = lastPos.current.x * canvas.width;
    const y0 = lastPos.current.y * canvas.height;
    const x1 = currentNormX * canvas.width;
    const y1 = currentNormY * canvas.height;

    ctx.save();
    if (tool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineWidth = 26;
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = color;
      ctx.lineWidth = tool === "highlighter" ? 16 : 3.5;
      ctx.globalAlpha = tool === "highlighter" ? 0.35 : 1.0;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    }

    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
    ctx.restore();

    if (roomChannel) {
      roomChannel.send({
        type: "broadcast",
        event: "wb_stroke",
        payload: {
          x0: lastPos.current.x,
          y0: lastPos.current.y,
          x1: currentNormX,
          y1: currentNormY,
          color,
          tool,
        },
      });
    }

    lastPos.current = { x: currentNormX, y: currentNormY };
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (roomChannel) {
      roomChannel.send({
        type: "broadcast",
        event: "wb_clear",
        payload: {},
      });
    }
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
          isTeacher && isActive ? "pointer-events-auto cursor-crosshair" : "pointer-events-none"
        }`}
      />

      {isTeacher && isActive && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 max-w-[94%] bg-gray-900/95 backdrop-blur-md px-2.5 py-1.5 rounded-2xl border border-gray-700 shadow-2xl flex items-center gap-1.5 sm:gap-2 text-white">
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