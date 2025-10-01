"use client";

import React, { useState, useEffect } from "react";
import { Send, X, FileText, Eye } from "lucide-react";
import axios from "axios";
import Returnpage from "./returnpage";
import { useTextFormatter } from "@/context/TextFormatterContext";
import { useLoader } from "@/context/LoaderContext";




interface DocumentType {
  id: string;
  name: string;
  content: string | null; // Changed to string for URL
  file?: File;  // Added to store the original file
}

interface FileInfo {
  name: string;
  path: string;
  modified_time: string;
}

interface ChatMessage {
  text: string;
  sender: "user" | "bot";
  timestamp: string;
}
const DocumentViewer: React.FC<{ documents: DocumentType[]; onClose: () => void }> = ({ 
  documents = [], 
  onClose 
}) => {
  const [selectedDoc, setSelectedDoc] = useState<DocumentType | null>(null);

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
          <div className="w-1/4 border-r pr-4">
            {documents.map((doc) => (
              <div
                key={doc.id}
                onClick={() => setSelectedDoc(doc)}
                className={`p-2 cursor-pointer hover:bg-gray-100 rounded flex items-center ${
                  selectedDoc?.id === doc.id ? "bg-gray-100" : ""
                }`}
              >
                <FileText size={16} className="mr-2 shrink-0" />
                <span className="truncate">{doc.name}</span>
              </div>
            ))}
          </div>
          <div className="flex-1 pl-4 overflow-hidden">
            {selectedDoc ? (
              selectedDoc.content ? (
                <iframe
                  src={selectedDoc.content}
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
// History Panel Component
const HistoryPanel: React.FC<{
  history: FileInfo[];
  onClose: () => void;
}> = ({ history, onClose }) => {
  return (
    <div className="absolute right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg p-4 w-96">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">History</h3>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
          <X size={16} />
        </button>
      </div>
      {history.length > 0 ? (
        <ul className="space-y-2">
          {history.map((file) => (
            <li key={file.path} className="p-2 hover:bg-gray-50 rounded">
              <a 
                href={file.path} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {file.name}
              </a>
              <small className="block text-gray-500">
                Last modified: {new Date(file.modified_time).toLocaleString()}
              </small>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">No recent files found.</p>
      )}
    </div>
  );
};

// Document Upload Component
const DocumentUpload: React.FC<{ 
  onFileUpload: (files: File[]) => void;
  enableComparison?: boolean;
}> = ({ 
  onFileUpload,
  enableComparison = false
}) => {
  const [files, setFiles] = useState<File[]>([]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, index?: number) => {
    const newFiles = [...files];
    const uploadedFiles = Array.from(e.target.files || []);
    
    if (uploadedFiles.length > 0) {
   
      if (typeof index === "number") {
        newFiles[index] = uploadedFiles[0];
      } else {
        newFiles.push(...uploadedFiles);
      }
      setFiles(newFiles);
      onFileUpload(newFiles);
 
    }
  };

  return (
    <div className="mb-4 p-4 bg-white rounded-lg shadow">
      {enableComparison ? (
        <div className="space-y-4">
          {[0, 1].map((index) => (
            <div key={index}>
              <label className="block text-sm font-medium mb-2">Document {index + 1}</label>
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => handleFileChange(e, index)}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-200 file:text-gray-700 hover:file:bg-gray-300"
              />
            </div>
          ))}
        </div>
      ) : (
        <input
          type="file"
          accept="application/pdf"
          multiple
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-200 file:text-gray-700 hover:file:bg-gray-300"
        />
      )}
    </div>
  );
};

// Main Component
const LexCitation: React.FC = () => {
  // const [messages, setMessages] = useState<Message[]>([]);
  const [documents, setDocuments] = useState<DocumentType[]>([]);
  const [showDocViewer, setShowDocViewer] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [, setLoading] = useState(false);
  const [, setError] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [sessionID, setSessionID] = useState<string | null>(null);
  const [isResponseLoading, setIsResponseLoading] = useState(false);
  const [history, setHistory] = useState<FileInfo[]>([]);
  const folderName = "legal-research";
  const { showLoader, hideLoader } = useLoader();
  const { formatResponse } = useTextFormatter();
  // const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
  const apiUrl = "http://16.171.194.217:80";
  const [showInitialText, setShowInitialText] = useState(true);


  const initialTexts = [
    "Lex Citation is a feature that automatically generates accurate legal citations,",
    "ensuring that legal documents are properly referenced and formatted.",
    "This tool can automatically generate citations for a wide range of legal",
    "sources, including statutes, court cases, law review articles, and more.",
    
  ];
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get(`${apiUrl}/recent-files/${folderName}`);
        setHistory(res.data);
      } catch (err) {
        console.error("Failed to fetch history:", err);
      }
    };

    fetchHistory();
  }, []);

 
  const handleFileUpload = async (files: File[]) => {
    if (files.length === 0) return;

    setLoading(true);
    setError(null);
    showLoader("")
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("file", file);
      });

      const response = await axios.post(`${apiUrl}/legal-research/`, formData);
      
      const initialBotMessage: ChatMessage = {
        text: response.data.research_result || "Generated lex Citation will appear here.",
        sender: "bot",
        timestamp: new Date().toLocaleString()
      };

      setChatHistory([initialBotMessage]);
      setSessionID(response.data.session_id);
        // Hide initial text when document is uploaded
        setShowInitialText(false);
      // Create object URLs for the files and store them
      const newDocs: DocumentType[] = files.map((file, index) => ({
        id: `doc-${index}`,
        name: file.name,
        content: URL.createObjectURL(file),
        file: file
      }));
      
      setDocuments(prev => [...prev, ...newDocs]);

    } catch (err) {
      setError("Failed to process document. Please try again.");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
    hideLoader("")
  };

  // Cleanup object URLs when component unmounts
  useEffect(() => {
    return () => {
      documents.forEach(doc => {
        if (doc.content) {
          URL.revokeObjectURL(doc.content);
        }
      });
    };
  }, [documents]);
  const handleSendMessage = async () => {
    if (!inputValue.trim() || !sessionID) return;

    const newUserMessage: ChatMessage = {
      text: inputValue,
      sender: "user",
      timestamp: new Date().toLocaleString()
    };

    setChatHistory(prev => [...prev, newUserMessage]);
    setInputValue("");
    setIsResponseLoading(true);
      // Hide initial text when document is uploaded
      setShowInitialText(false);

    try {
      const response = await axios.post(`${apiUrl}/continue-conversation-legal-research/`, {
        user_input: inputValue,
        session_id: sessionID
      });

      const botResponse: ChatMessage = {
        text: response.data.response,
        sender: "bot",
        timestamp: new Date().toLocaleString()
      };

      setChatHistory(prev => [...prev, botResponse]);
    } catch (error) {
      console.error("Error sending chat:", error);
      setError("Failed to send message. Please try again.");
    } finally {
      setIsResponseLoading(false);
    }
  };

  return (
    <div className="flex flex-col bg-gray-100 text-black h-full">
      <header className="border-b p-2 bg-white flex justify-between items-center">
      <Returnpage />
        <h1 className="text-xl font-semibold">Lex Citation</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="px-4 py-2 bg-white text-black rounded-lg border border-black hover:bg-gray-200 focus:outline-none"
          >
            History
          </button>
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

      <div className="flex-1 flex flex-col p-4">
      {showInitialText && (
          <div className="p-4 bg-white rounded-lg shadow mb-4 text-center animate-pulse">
            <p className="text-gray-700 font-bold">
              {initialTexts.join("")}
            </p>
          </div>
        )}
        <DocumentUpload onFileUpload={handleFileUpload} />

        <div className="flex-1 overflow-y-auto space-y-4">
          {chatHistory.map((message, index) => (
            <div 
              key={index} 
              className={`p-2 rounded-lg ${
                message.sender === "user"
                  ? "ml-auto bg-gray-200" 
                  : "mr-auto bg-white "
              }` } style={{width:"80vw"}}
            >
              <>{formatResponse(message.text)}</>
              <div className="text-xs text-gray-500 mt-1">
                {message.timestamp}
              </div>
            </div>
          ))}
          {isResponseLoading && (
            <div className="mr-auto bg-white max-w-md p-2 rounded-lg">
              Loading...
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
            className="flex-1 p-2 border rounded-lg bg-gray-100 text-black focus:outline-none focus:ring-2 focus:ring-gray-500"
          />
          <button 
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isResponseLoading}
            className="p-2 bg-gray-300 text-black rounded-lg hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
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
      
      {showHistory && (
        <HistoryPanel 
          history={history} 
          onClose={() => setShowHistory(false)} 
        />
      )}
    </div>
  );
};

export default LexCitation;