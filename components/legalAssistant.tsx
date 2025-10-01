"use client";

import React, { useEffect, useState } from "react";
import { Send, X, FileText, Eye } from "lucide-react";
import axios from "axios";
import Returnpage from "./returnpage";
import { useTextFormatter } from "@/context/TextFormatterContext";
import { useLoader } from "@/context/LoaderContext";


const API_BASE_URL = "http://44.211.157.24:8000";

interface Message {
  text: string;
  sender: "user" | "bot";
  timestamp: string;
}

interface DocumentType {
  id: string;
  name: string;
  content: ArrayBuffer | null;
}

interface FileInfo {
  name: string;
  path: string;
  modified_time: string;
}

// Document Viewer Component
const DocumentViewer: React.FC<{ documents: DocumentType[]; onClose: () => void }> = ({ 
  documents, 
  onClose 
}) => {
  const [selectedDoc, setSelectedDoc] = useState<DocumentType | null>(null);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  useEffect(() => {
    if (selectedDoc?.content) {
      const blob = new Blob([selectedDoc.content], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setObjectUrl(url);

      return () => {
        if (url) URL.revokeObjectURL(url);
      };
    }
  }, [selectedDoc]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
       <Returnpage />
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
                <FileText size={16} className="mr-2" />
                <span className="truncate">{doc.name}</span>
              </div>
            ))}
          </div>
          <div className="flex-1 pl-4 overflow-hidden">
            {selectedDoc ? (
              objectUrl ? (
                <iframe
                  src={`${objectUrl}#toolbar=0`}
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
const DocumentUpload: React.FC<{ onFileUpload: (file: File) => Promise<void> }> = ({ 
  onFileUpload 
}) => {
  return (
    <div className="mb-4 p-4 bg-white rounded-lg shadow">
      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFileUpload(file);
        }}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-200 file:text-gray-700 hover:file:bg-gray-300"
      />
    </div>
  );
};

// History Panel Component
const HistoryPanel: React.FC<{
  history: FileInfo[];
  onClose: () => void;
}> = ({ history, onClose }) => {
  return (
    <div className="absolute right-5 mt-2 top-30 bg-white border border-gray-300 rounded-lg shadow-lg p-4 w-96">
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

// Chat Message Component
const ChatMessage: React.FC<{ message: Message }> = ({ message }) => {
  const { formatResponse } = useTextFormatter();
  return (
    <div 
      className={`p-4 rounded-lg  ${
        message.sender === "user" 
          ? "ml-auto bg-gray-200" 
          : "mr-auto bg-white"
      }` }style={{ width:'80vw'}}
    >
      <> {formatResponse(message.text)}</>
      <small className="text-gray-500 text-xs mt-1 block">
       {message.timestamp} 
      </small>
    </div>
  );
};

// Main Component
const LegalAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [documents, setDocuments] = useState<DocumentType[]>([]);
  const [showDocViewer, setShowDocViewer] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<FileInfo[]>([]);
  const [currentDocumentId, setCurrentDocumentId] = useState<string | null>(null);
    const { showLoader, hideLoader } = useLoader();
    const [showInitialText, setShowInitialText] = useState(true);
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/recent-files/query_documents`);
      setHistory(response.data);
    } catch (err) {
      console.error('Error fetching history:', err);
      setError('Failed to load history');
    }
  };

  const handleFileUpload = async (file: File) => {
    setLoading(true);
    setError(null);
    showLoader("")
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post(`${API_BASE_URL}/upload_document/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
        // Hide initial text when document is uploaded
      });
      setShowInitialText(false);

      // Add document to viewable documents
      const reader = new FileReader();
      reader.onload = () => {
        const newDoc = {
          id: response.data.document_id,
          name: file.name,
          content: reader.result as ArrayBuffer
        };
        setDocuments(prev => [...prev, newDoc]);
      };
      reader.readAsArrayBuffer(file);

      // Set the current document ID
      setCurrentDocumentId(response.data.document_id);

      // Add initial bot message
      setMessages(prev => [...prev, {
        text: response.data.bg || "You can ask your query related to the document.",
        sender: "bot",
        timestamp: new Date().toLocaleString()
      }]);

      // Refresh history
      fetchHistory();
    } catch (err) {
      setError("Failed to upload document. Please try again.");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
    hideLoader("")
  };

  const handleSendMessage = async () => {
    if (!userInput.trim() || !currentDocumentId) return;
    showLoader("")
    // Add user message
    const newUserMessage: Message = {
      text: userInput,
      sender: "user",
      timestamp: new Date().toLocaleString()
    };
    setMessages(prev => [...prev, newUserMessage]);
      // Hide initial text when document is uploaded
      setShowInitialText(false);
    // Clear input
    setUserInput("");
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/query_document/`, {
        question: userInput,
        document_id: currentDocumentId
      });

      // Format and add bot response
      const botMessage: Message = {
        text: response.data.answer,
        sender: "bot",
        timestamp: new Date().toLocaleString()
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      setError("Failed to get response. Please try again.");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
    hideLoader("")
  };
  const initialTexts = [
    "Our AI-powered document analysis assistant is designed to revolutionize the way legal professionals work",
    "Lex Assistant, you can quickly and accurately query your vast document collections, extracting relevant",
    "information and insights in a matter of seconds. Optimize your legal processes, elevate your efficiency,",
    "and achieve outstanding outcomes with the power of Lex Assistant.",
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 text-black">
      <header className="border-b p-2 bg-white flex justify-between items-center">
       <Returnpage />
        <h1 className="text-xl font-semibold">Legal Assistant</h1>
        <div className="flex gap-3">
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
         {/* Initial text section - shown only when no documents uploaded */}
         {showInitialText && (
          <div className="p-4 bg-white rounded-lg shadow mb-4 text-center animate-pulse">
            <p className="text-gray-700 font-bold">
              {initialTexts.join("")}
            </p>
          </div>
        )}
        <DocumentUpload onFileUpload={handleFileUpload} />

        {loading && (
          <div className="text-center py-2">
            <p className="text-gray-600">Processing...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-2">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <div className="flex-1 overflow-y-auto space-y-4 p-4">
          {messages.map((message, index) => (
            <ChatMessage key={index} message={message} />
          ))}
        </div>

        <div className="p-4 bg-white border-t mt-auto">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Type your query about the document..."
              disabled={!currentDocumentId}
              className="flex-1 p-2 border rounded-lg bg-gray-100 text-black focus:outline-none focus:ring-2 focus:ring-gray-500"
            />
            <button 
              onClick={handleSendMessage}
              disabled={!currentDocumentId || loading}
              className="p-2 bg-gray-300 text-black rounded-lg hover:bg-gray-400 disabled:opacity-50"
            >
              <Send size={20} />
            </button>
          </div>
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

export default LegalAssistant;