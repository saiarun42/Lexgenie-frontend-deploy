"use client";

import React, { useEffect, useState } from "react";
import { Send, X, FileText, Eye } from "lucide-react";
import axios from "axios";
import Returnpage from "../returnpage";
import { useLoader } from "@/context/LoaderContext";
import { useTextFormatter } from "@/context/TextFormatterContext";

interface Message {
  content: string;
  timestamp: Date;
  isUser: boolean;
}

interface DocumentType {
  id: string;
  name: string;
  url?: string;
  content?: ArrayBuffer | null;
}

interface HistoryItem {
  id: string;
  name: string;
  url: string;
  modified_time: string;
}

// Document Viewer Component
const DocumentViewer: React.FC<{ documents: DocumentType[]; onClose: () => void }> = ({
  documents,
  onClose
}) => {
  const [selectedDoc, setSelectedDoc] = useState<DocumentType | null>(null);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  // Create URL for selected document
  useEffect(() => {
    if (selectedDoc) {
      if (selectedDoc.content) {
        // Local file with content
        const blob = new Blob([selectedDoc.content], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setObjectUrl(url);
        
        return () => {
          URL.revokeObjectURL(url);
        };
      } else if (selectedDoc.url) {
        // Remote file with URL
        setObjectUrl(selectedDoc.url);
      }
    } else {
      setObjectUrl(null);
    }
  }, [selectedDoc]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-3/4 h-3/4 flex flex-col p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Document Viewer</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X size={20} />
          </button>
        </div>
        
        <div className="flex h-full">
          <div className="w-1/4 border-r pr-4 overflow-y-auto">
            {documents.map((doc) => (
              <div
                key={doc.id}
                onClick={() => setSelectedDoc(doc)}
                className={`p-2 cursor-pointer hover:bg-gray-100 rounded flex items-center ${
                  selectedDoc?.id === doc.id ? "bg-gray-100" : ""
                }`}
              >
                <FileText size={16} className="mr-2" />
                <span className="truncate">{doc.name}</span>
              </div>
            ))}
          </div>
          <div className="flex-1 pl-4 overflow-hidden">
            {selectedDoc ? (
              objectUrl ? (
                <iframe
                  src={objectUrl}
                  className="w-full h-full border-0"
                  title="Document viewer"
                />
              ) : (
                <div className="text-center text-gray-500 mt-10">Loading document...</div>
              )
            ) : (
              <div className="text-center text-gray-500 mt-10">Select a document to view</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Document Upload Component
const DocumentUpload: React.FC<{ onFileUpload: (files: File[]) => void }> = ({ onFileUpload }) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      onFileUpload(Array.from(e.target.files));
    }
  };

  return (
    <div className="mb-4 p-4 bg-white rounded-lg shadow">
      <input
        type="file"
        accept=".pdf,.doc,.docx"
        onChange={handleFileChange}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-200 file:text-gray-700 hover:file:bg-gray-300"
      />
    </div>
  );
};

// History Component

const HistoryPanel: React.FC<{ history: HistoryItem[]; isOpen: boolean; onClose: () => void }> = ({
  history,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="absolute right-0 top-12 mt-2 w-80 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-96 overflow-y-auto">
      <div className="flex justify-between items-center p-3 border-b">
        <h3 className="font-medium">Recent Documents</h3>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full" aria-label="Close panel">
          <X size={16} />
        </button>
      </div>

      {history.length > 0 ? (
        <ul className="py-2">
          {history.map((file) => (
            <li key={file.id || file.url} className="px-4 py-2 hover:bg-gray-100">
              <a href={file.url} target="_blank" rel="noopener noreferrer" className="block text-blue-600 hover:underline">
                {file.name}
              </a>
              <small className="text-gray-500 block">
                {file.modified_time ? new Date(file.modified_time).toLocaleString() : "Unknown date"}
              </small>
            </li>
          ))}
        </ul>
      ) : (
        <p className="p-4 text-gray-500 text-center">No recent files found.</p>
      )}
    </div>
  );
};


// Main Chat Layout Component
const BnsSearch: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [documents, setDocuments] = useState<DocumentType[]>([]);
  const [showDocViewer, setShowDocViewer] = useState(false);
  const [inputValue, setInputValue] = useState("");
  // const [userMessage, setUserMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<HistoryItem[]>([]);
  const [sessionID, setSessionID] = useState<string | null>(null);
  const [isResponseLoading, setIsResponseLoading] = useState<boolean>(false);
  const { showLoader, hideLoader } = useLoader();
  const { formatResponse } = useTextFormatter();
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  // State for showing initial text
  const [showInitialText, setShowInitialText] = useState(true);
  
  // Initial text content
  const initialTexts = [
    "The Bharatiya Nyaya Sanhita (BNS), or 'Indian Justice Code,' is India's new criminal code,",
    " effective from July 1, 2024. It is used in the Indian legal system ",
    "to define and reference specific rules and offences.",
    "Start by uploading your document or typing a short description to get help with",
    " BNS Search using Lex Genie AI",
  ];
  
  // State for history
  const folderName = "ipc-classifier"; // Default folder name

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get(`http://44.211.157.24:8000/recent-files/${folderName}`);
        console.log("History Data:", res.data); // Debugging log
        setChatHistory(res.data);
      } catch (err) {
        console.error("Failed to fetch history:", err);
      }
    };
    fetchHistory();
  }, []);

  const handleFileUpload = async (files: File[]) => {
    showLoader("upload");
    if (files.length === 0) return;

    try {
      // First, read the file content for local display
      const reader = new FileReader();
      const content = await new Promise<ArrayBuffer>((resolve, reject) => {
        reader.onload = () => {
          if (reader.result instanceof ArrayBuffer) {
            resolve(reader.result);
          } else {
            reject(new Error("Failed to read file as ArrayBuffer"));
          }
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsArrayBuffer(files[0]);
      });

      const formData = new FormData();
      formData.append("file", files[0]);

      const response = await axios.post("http://44.211.157.24:8000/ipc-classifier", formData);

      if (!response.data || !response.data.session_id) {
        throw new Error("Session ID not received");
      }

      setSessionID(response.data.session_id);
      // Hide initial text when document is uploaded
      setShowInitialText(false);

      setMessages((prev) => [
        ...prev,
        {
          content: `**Identified IPC Sections:**\n${response.data.ipc_sections}`,
          timestamp: new Date(),
          isUser: false,
        },
      ]);
      
      setDocuments((prev) => [
        ...prev,
        {
          id: response.data.session_id,
          name: files[0].name,
          url: `http://44.211.157.24:8000${response.data.view_url}`,
          content: content
        },
      ]);
      
      // Refresh history after upload
      try {
        const res = await axios.get(`http://44.211.157.24:8000/recent-files/${folderName}`);
        setChatHistory(res.data);
      } catch (err) {
        console.error("Failed to refresh history:", err);
      }
      
    } catch (error) {
      console.error("Error uploading file:", error);
      setMessages((prev) => [
        ...prev,
        { content: "Error processing the document. Please try again.", timestamp: new Date(), isUser: false },
      ]);
    } finally {
      hideLoader("upload");
    }
  };
  
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    
    showLoader("query");
    if (!sessionID) {
      setMessages(prev => [
        ...prev, 
        { 
          content: "Error: No session ID found. Please upload a document first.", 
          timestamp: new Date(), 
          isUser: false 
        }
      ]);
      hideLoader("query");
      return;
    }

    // Hide initial text when user sends a message
    setShowInitialText(false);

    const newUserMessage: Message = {
      content: inputValue,
      timestamp: new Date(),
      isUser: true,
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setInputValue("");
    setIsResponseLoading(true);

    try {
      const payload = { user_input: inputValue, session_id: sessionID };
      const response = await axios.post("http://44.211.157.24:8000/continue-conversation-ipc", payload);
      setMessages((prev) => [
        ...prev, 
        { 
          content: response.data.response, 
          timestamp: new Date(), 
          isUser: false 
        }
      ]);
    } catch (error) {
      console.error("Error getting response:", error);
      setMessages((prev) => [
        ...prev, 
        { 
          content: "Error getting a response from the server. Please try again later.", 
          timestamp: new Date(), 
          isUser: false 
        }
      ]);
    } finally {
      setIsResponseLoading(false);
      hideLoader("query");
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-100 text-black">
      <header className="border-b p-2 bg-white flex justify-between items-center">
        <div className="flex items-center">
          <Returnpage />
          <h1 className="text-xl font-semibold ml-2">BNS Search</h1>
        </div>
        
        <div className="flex gap-2 relative">
          <button
            onClick={() => setIsHistoryOpen(!isHistoryOpen)}
            className="px-4 py-2 bg-white text-black rounded-lg border border-gray-300 hover:bg-gray-100 focus:outline-none"
          >
            History
          </button>
          
          <HistoryPanel 
            history={chatHistory} 
            isOpen={isHistoryOpen} 
            onClose={() => setIsHistoryOpen(false)} 
          />
          
          {documents.length > 0 && (
            <button
              onClick={() => setShowDocViewer(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              <Eye size={16} />
              View Documents
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 w-full flex flex-col p-4">
        {/* Initial text section - shown only when no documents uploaded */}
        {showInitialText && (
          <div className="p-4 bg-white rounded-lg shadow mb-4 text-center">
            <p className="text-gray-700 font-medium">
              {initialTexts.join("")}
            </p>
          </div>
        )}
        
        <DocumentUpload onFileUpload={handleFileUpload} />
        
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg ${
                message.isUser
                  ? "ml-auto bg-gray-200"
                  : "mr-auto bg-white"
              }`}
              style={{ width: '80vw', maxWidth: '100%' }}
            >
              <div className="mb-2">{formatResponse(message.content)}</div>
              <small className="text-gray-500 text-xs">
                {new Date(message.timestamp).toLocaleString()}
              </small>
            </div>
          ))}
          
          {isResponseLoading && (
            <div className="mr-auto bg-white p-4 rounded-lg" style={{ width: '80vw', maxWidth: '100%' }}>
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-gray-300 rounded-full animate-bounce"></div>
                <div className="w-3 h-3 bg-gray-300 rounded-full animate-bounce delay-75"></div>
                <div className="w-3 h-3 bg-gray-300 rounded-full animate-bounce delay-150"></div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 bg-white border-t">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Type your message..."
            className="flex-1 p-3 border rounded-lg bg-gray-100 text-black focus:outline-none focus:ring-2 focus:ring-gray-500"
          />
          <button
            onClick={handleSendMessage}
            disabled={isResponseLoading}
            className={`p-3 rounded-lg flex items-center justify-center ${
              isResponseLoading ? "bg-gray-200 cursor-not-allowed" : "bg-gray-300 hover:bg-gray-400"
            }`}
          >
            <Send size={20} />
          </button>
        </div>
      </div>

      {showDocViewer && (
        <DocumentViewer
          documents={documents}
          onClose={() => setShowDocViewer(false)}
        />
      )}
    </div>
  );
};

export default BnsSearch;