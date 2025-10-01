"use client";

import React, { useState, useEffect, useRef , useCallback} from "react";
import { Send, FileText, Loader2, Download, MessageSquare } from "lucide-react";

import Returnpage from "./returnpage";
import { useTextFormatter } from "@/context/TextFormatterContext";
interface Message {
  type: "question" | "answer" | "error";
  content: string;
}

const employeeForm: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [generating, setGenerating] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [documentId, setDocumentId] = useState<string | null>(null);
  
  // const [documentPath, setDocumentPath] = useState<string | null>(null);
  const [agreementText, setAgreementText] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const { formatResponse } = useTextFormatter();

  // Helper function to ensure content is a string
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



  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchInitialQuestion = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('http://44.211.157.24:8000/employeeagreementchat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      setMessages([
        {
          type: "question",
          content: ensureString(data.message),
        },
      ]);
    } catch (error) {
      console.error("Error fetching initial question:", error);
      setMessages([
        {
          type: "error",
          content: "There was an error connecting to the server. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array ensures it's memoized correctly

  useEffect(() => {
    fetchInitialQuestion();
  }, [fetchInitialQuestion]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || loading) return;
    
    const userMessage = message;
    setMessage("");
    
    // Add user message to chat
    setMessages(prev => [
      ...prev,
      {
        type: "answer",
        content: userMessage,
      },
    ]);
    
    // Send user response to API
    try {
      setLoading(true);
      
      const response = await fetch('http://44.211.157.24:8000/employeeagreementprocess_response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage }),
      });
      
      const data = await response.json();
      
      // Check if we received the final agreement
      if (data.agreement_text) {
        setGenerating(true);
        
        // Set the agreement text and document path
        setAgreementText(ensureString(data.agreement_text));
        setDocumentId(data.document_id || null);
        
        // Add a message indicating the agreement is ready
        setMessages(prev => [
          ...prev,
          {
            type: "question",
            content: "Your employee agreement has been generated successfully!",
          },
        ]);
        
        setGenerating(false);
      } else {
        // Add the next question to chat
        setMessages(prev => [
          ...prev,
          {
            type: "question",
            content: ensureString(data.message),
          },
        ]);
      }
    } catch (error) {
      console.error("Error sending response:", error);
      setMessages(prev => [
        ...prev,
        {
          type: "error",
          content: "There was an error processing your response. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
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
      a.download = "employee_Agreement.doc";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      console.log("Downloaded Employee Agreement successfully.");
    } catch (error) {
      console.error("Download error:", error);
    }
  };
  return (
    <div className="min-h-screen bg-gray-50 p-10 md:p-8">
      <div className="max-w-4xl mx-auto mt-10">
        <div className="bg-white rounded-t-lg shadow-sm border border-gray-200 p-4">
          <Returnpage />
          <div className="flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Employee Agreement</h2>
          </div>
        </div>

        {generating && (
          <div className="flex flex-col items-center justify-center mt-5">
            <p className="text-lg font-semibold text-gray-600">Generating your agreement...</p>
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
                  <div>{safeFormatResponse(msg.content)}</div>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
        </div>

        <div className="bg-white rounded-b-lg shadow-sm border border-t-0 border-gray-200 p-4">
          <form className="flex gap-4" onSubmit={handleSubmit}>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Type your response..."
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !message}
              className="inline-flex items-center gap-2 rounded-lg black-600 px-4 py-2 text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />} Send
            </button>
          </form>
        </div>

        {agreementText && (
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
                {safeFormatResponse(agreementText)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default employeeForm;


