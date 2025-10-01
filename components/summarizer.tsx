"use client";

import React, { useState, useEffect } from "react";
import { X, FileText, Eye } from "lucide-react";
import Returnpage from "./returnpage";
import { useTextFormatter } from "@/context/TextFormatterContext";
import { useLoader } from "@/context/LoaderContext";

// Types
interface Message {
  content: string;
  timestamp: Date;
  isUser: boolean;
}

interface FileInfo {
  name: string;
  path: string;
  modified_time: string;
}

interface DocumentType {
  id: string;
  name: string;
  content: string | ArrayBuffer | null;
}

// Document Viewer Component
const DocumentViewer: React.FC<{ 
  documents: DocumentType[]; 
  onClose: () => void 
}> = ({ 
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
        URL.revokeObjectURL(url);
      };
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
const DocumentUpload: React.FC<{ 
  onFileUpload: (file: File) => Promise<void> 
}> = ({ 
  onFileUpload 
}) => {
  return (
    <div className="mb-4 p-4 bg-white rounded-lg shadow">
      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            onFileUpload(file);
          }
        }}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-200 file:text-gray-700 hover:file:bg-gray-300"
      />
    </div>
  );
};

// History Component
const HistoryPanel: React.FC<{
  history: FileInfo[];
  onClose: () => void;
}> = ({ history, onClose }) => {
  return (
    <div className="z-10 absolute right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg p-4 w-96">
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

// Main Component
const Summarizer: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [documents, setDocuments] = useState<DocumentType[]>([]);
  const [showDocViewer, setShowDocViewer] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  // const [inputValue, setInputValue] = useState("");
  const [history, setHistory] = useState<FileInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
     const { showLoader, hideLoader } = useLoader();
  const { formatResponse } = useTextFormatter();
  const folderName = "text-summarizer";
    const [showInitialText, setShowInitialText] = useState(true);
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await fetch(`http://44.211.157.24:8000/recent-files/${folderName}`);
      if (!response.ok) throw new Error('Failed to fetch history');
      const data = await response.json();
      setHistory(data);
    } catch (err) {
      console.error('Error fetching history:', err);
      setError('Failed to load history');
    }
  };

  const handleFileUpload = async (file: File) => {
    setLoading(true);
    setError(null);
    showLoader("upload")
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch('http://44.211.157.24:8000/text-summarizer/', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
          // Hide initial text when document is uploaded
          setShowInitialText(false);
      // Add system message with summary
      setMessages(prev => [...prev, {
        content: data.summary || "No summary generated.",
        timestamp: new Date(),
        isUser: false
      }]);

      // Add to documents list for viewing
      const reader = new FileReader();
      reader.onload = () => {
        setDocuments(prev => [...prev, {
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          content: reader.result
        }]);
      };
      reader.readAsArrayBuffer(file);

      // Refresh history
      fetchHistory();
    } catch (err) {
      setError('Failed to process document. Please try again.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
    hideLoader("upload")
  };

  const initialTexts = [
    "Our AI model analyses your text and identifies the most important information.",
    "Then, the Lex Summarizer condenses it down into an easy-to-digest summary.",
    "It not only helps you save time but also retains critical information and does it in a flash.",
    "Begin by uploading your document and use Lex Summarizer to aid with Summarizing!",
  ];

  return (
    <div className="flex flex-col bg-gray-100 text-black" style={{ height: "80vh" }}>
      <header className="border-b p-2 bg-white flex justify-between items-center">
       <Returnpage />
        <h1 className="text-xl font-semibold">Summarizer</h1>
        <div className="flex gap-2 relative">
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
          
          {showHistory && (
            <HistoryPanel 
              history={history} 
              onClose={() => setShowHistory(false)} 
            />
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

        {loading && (
          <div className="text-center p-4">
            <p className="text-gray-600">Processing document...</p>
          </div>
        )}

        {error && (
          <div className="text-center p-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <div className="flex-1 overflow-y-auto space-y-4">
          {messages.map((message, index) => (
            <div 
              key={index} 
              className={`p-2 rounded-lg ${
                message.isUser 
                  ? "ml-auto bg-gray-200" 
                  : "mr-auto bg-white"
              }`}  style={{ width: '80vw' }}
            >
            <>{formatResponse(message.content)}</> 
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 bg-white border-t">
        <div className="flex items-center gap-2">
          <hr />
          <i>Summarizer view</i>
          {/* <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Type your message..."
            className="flex-1 p-2 border rounded-lg bg-gray-100 text-black focus:outline-none focus:ring-2 focus:ring-gray-500"
          />
          <button 
            onClick={handleSendMessage}
            className="p-2 bg-gray-300 text-black rounded-lg hover:bg-gray-400"
          >
            <Send size={20} />
          </button> */}
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

export default Summarizer;