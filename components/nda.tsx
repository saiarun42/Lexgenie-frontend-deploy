"use client";

import React, { useState, useEffect, useRef } from "react";
import { Send, FileText, Loader2, Download, MessageSquare } from "lucide-react";
import Returnpage from "./returnpage";
import { useTextFormatter } from "@/context/TextFormatterContext";

interface Message {
  type: "question" | "answer" | "error";
  content: string;
}

const LeaseForm: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [leaseAgreement, setLeaseAgreement] = useState<string | null>(null);
  const [documentId, setDocumentId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const [generating, setGenerating] = useState<boolean>(false);
  const [ndaText, setNdatText] = useState<string | null>(null);
  const { formatResponse } = useTextFormatter();

  useEffect(() => {
    setMessages([
      {
        type: "question",
        content: "Who is the (party_a)?",
      },
    ]);
  }, []);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    setMessages(prev => [...prev, { type: "answer", content: message }]);

    try {
      const response = await fetch("http://44.211.157.24:8000/nda_process_response", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: message.trim() }),
      });

      const data = await response.json();

      if (data.nda_details) {
        setGenerating(true);

        setTimeout(() => {
          setLeaseAgreement(data.nda_details);
          setNdatText(data.nda_details);
          setDocumentId(data.document_id); // Store document_id for downloading
          setGenerating(false);
        }, 2000);
      } else if (data.message) {
        setMessages(prev => [...prev, { type: "question", content: data.message ?? "Unknown question" }]);
      }
    } catch (error) {
      console.error("Error:", error);
      setMessages(prev => [...prev, { type: "error", content: "An error occurred. Please try again." }]);
    } finally {
      setLoading(false);
      setMessage("");
    }
  };

  const handleDownload = async () => {
    if (!documentId) {
      console.error("No document available for download.");
      return;
    }

    try {
      const response = await fetch(`http://44.211.157.24:8000/download-document/${documentId}`);

      if (!response.ok) {
        throw new Error("Failed to download document.");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "NDA_Agreement.doc";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      console.log("Downloaded NDA Agreement successfully.");
    } catch (error) {
      console.error("Download error:", error);
    }
  };

  const ensureString = (content: any): string => {
    if (content === null || content === undefined) {
      return "";
    }
    return typeof content === "string" ? content : JSON.stringify(content);
  };
  // Safe wrapper for formatResponse
  const safeFormatResponse = (content: any) => {
    try {
      return formatResponse(ensureString(content));
    } catch (error) {
      console.error("Error formatting response:", error);
      return ensureString(content);
    }
  };
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto mt-10">
        <div className="bg-white rounded-t-lg shadow-sm border border-gray-200 p-4">
          <Returnpage />
          <div className="flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">NDA (Non-Disclosure Agreement)</h2>
          </div>
        </div>

        {generating && (
          <div className="flex flex-col items-center justify-center mt-5">
            <p className="text-lg font-semibold text-gray-600">Generating your NDA Agreement...</p>
            <div className="mt-3 w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        <div className="bg-white border-l border-r border-gray-200 h-[60vh] overflow-y-auto p-4">
          <div className="space-y-4">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.type === "answer" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    msg.type === "answer"
                      ? "bg-gray-100 text-white"
                      : msg.type === "error"
                      ? "bg-red-100 text-red-700"
                      : "bg-gray-100 text-gray-900"
                  }`}
                >
                  <>{formatResponse(msg.content)}</>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
        </div>

        <div className="bg-white rounded-b-lg shadow-sm border border-t-0 border-gray-200 p-4">
          <form onSubmit={handleSubmit} className="flex gap-4">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors"
              placeholder="Type your response..."
            />
            <button
              type="submit"
              disabled={loading || !message}
              className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />} Send
            </button>
          </form>
        </div>

        {leaseAgreement && (
          <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText className="h-6 w-6 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">Generated Agreement</h3>
              </div>
              <div className="flex gap-2">
                <button onClick={handleDownload} className="inline-flex items-center gap-2 bg-black px-4 py-2 text-white hover:bg-gray-700 rounded-lg">
                  <Download className="h-5 w-5" /> Download
                </button>
              </div>
            </div>
            <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50 max-h-[400px] overflow-y-auto">
              <div className="prose prose-sm">
                {safeFormatResponse(ndaText)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaseForm;
