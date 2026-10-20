import React, { useState, useEffect } from "react";
import { Loader2, AlertCircle } from "lucide-react";

export default function InAppPdfViewer({ pdfUrl }) {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isCancelled = false;

    const loadPdf = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load PDF.js dynamically from CDN if not already on window
        if (!window.pdfjsLib) {
          const script = document.createElement("script");
          script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
          document.body.appendChild(script);
          await new Promise((resolve) => (script.onload = resolve));
          window.pdfjsLib.GlobalWorkerOptions.workerSrc =
            "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
        }

        const loadingTask = window.pdfjsLib.getDocument(pdfUrl);
        const pdf = await loadingTask.promise;
        const renderedPages = [];

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 1.5 });
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          await page.render({ canvasContext: context, viewport: viewport }).promise;
          renderedPages.push(canvas.toDataURL());
        }

        if (!isCancelled) {
          setPages(renderedPages);
          setLoading(false);
        }
      } catch (err) {
        console.error("PDF Render Error:", err);
        if (!isCancelled) {
          setError("Failed to render PDF. Please upload a standard PDF.");
          setLoading(false);
        }
      }
    };

    if (pdfUrl) loadPdf();

    return () => {
      isCancelled = true;
    };
  }, [pdfUrl]);

  if (loading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-2 bg-gray-900">
        <Loader2 className="w-7 h-7 text-indigo-500 animate-spin" />
        <span className="text-xs">Processing & Rendering PDF Pages...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-red-400 gap-2 bg-gray-900 p-4 text-center">
        <AlertCircle className="w-8 h-8 text-red-500" />
        <span className="text-xs">{error}</span>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-y-auto overflow-x-hidden p-2 sm:p-4 space-y-4 bg-gray-950 touch-pan-y">
      {pages.map((imgSrc, index) => (
        <div key={index} className="flex flex-col items-center">
          <img
            src={imgSrc}
            alt={`Page ${index + 1}`}
            className="w-full max-w-2xl rounded-lg shadow-lg border border-gray-800"
          />
          <span className="text-[10px] text-gray-500 mt-1">Page {index + 1} of {pages.length}</span>
        </div>
      ))}
    </div>
  );
}