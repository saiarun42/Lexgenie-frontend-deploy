"use client";

import React, { useState } from "react";
import { Send, X, FileText, Eye } from "lucide-react";

interface Message {
  content: string;
  timestamp: Date;
  isUser: boolean;
}

interface DocumentType {
  id: string;
  name: string;
  content: ArrayBuffer | null;
}

interface ChatLayoutProps {
    pageTitle: string;
    apiEndpoints?: string[];
    enableComparison?: boolean;
    enableMultipleUploads?: boolean;
    onFileUpload?: (files: FileList) => Promise<void>;  // <-- Add this
    messages: Message[];  // <-- Also add messages prop
    onSendMessage: (message: string) => Promise<void>; // <-- Also add onSendMessage
  }
  

// Separate Document Viewer Component with proper content handling
const DocumentViewer: React.FC<{ documents: DocumentType[]; onClose: () => void }> = ({ 
  documents = [], 
  onClose 
}) => {
  const [selectedDoc, setSelectedDoc] = useState<DocumentType | null>(null);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  // Create object URL when document is selected
  React.useEffect(() => {
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

// Improved Document Upload Component
const DocumentUpload: React.FC<{ 
  enableComparison?: boolean; 
  onFileUpload: (files: File[]) => void 
}> = ({ 
  enableComparison = false, 
  onFileUpload 
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

// Main Chat Layout Component
const ChatLayout: React.FC<ChatLayoutProps> = ({ 
  pageTitle, 
  enableComparison = false 
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [documents, setDocuments] = useState<DocumentType[]>([]);
  const [showDocViewer, setShowDocViewer] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const handleFileUpload = async (files: File[]) => {
    try {
      const newDocs = await Promise.all(
        files.map(async (file) => {
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
            reader.readAsArrayBuffer(file);
          });

          return {
            id: Math.random().toString(36).substr(2, 9),
            name: file.name,
            content
          };
        })
      );
      setDocuments(prev => [...prev, ...newDocs]);
    } catch (error) {
      console.error("Error uploading files:", error);
      // You might want to show an error message to the user here
    }
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    setMessages(prev => [...prev, { 
      content: inputValue, 
      timestamp: new Date(), 
      isUser: true 
    }]);
    setInputValue("");
  };

  return (
    <div className="flex flex-col bg-gray-100 text-black" style={{ height: "80vh" }}>
      <header className="border-b p-2 bg-white flex justify-between items-center">
        <h1 className="text-xl font-semibold">{pageTitle}</h1>
        {documents.length > 0 && (
          <button
            onClick={() => setShowDocViewer(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            <Eye size={16} />
            View Documents
          </button>
        )}
      </header>

      <div className="flex-1 flex flex-col p-4">
        <DocumentUpload 
          enableComparison={enableComparison} 
          onFileUpload={handleFileUpload} 
        />

        <div className="flex-1 overflow-y-auto space-y-4">
          {messages.map((message, index) => (
            <div 
              key={index} 
              className={`p-2 rounded-lg ${
                message.isUser 
                  ? "ml-auto bg-gray-200 max-w-md" 
                  : "mr-auto bg-white max-w-md"
              }`}
            >
              {message.content}
            </div>
          ))}
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
            className="p-2 bg-gray-300 text-black rounded-lg hover:bg-gray-400"
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

export default ChatLayout;