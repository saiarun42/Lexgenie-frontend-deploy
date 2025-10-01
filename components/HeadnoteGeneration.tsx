"use client";

import React, { useEffect, useState } from "react";
import { X, FileText, Eye } from "lucide-react";
import Returnpage from "./returnpage";
import { useTextFormatter } from "@/context/TextFormatterContext";
import { useLoader } from "@/context/LoaderContext";



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

// Separate Document Viewer Component with proper content handling
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
                className={`p-2 cursor-pointer hover:bg-gray-100 rounded flex items-center ${selectedDoc?.id === doc.id ? "bg-gray-100" : ""
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
const DocumentUpload: React.FC<{ onFileUpload: (files: File[]) => void }> = ({ onFileUpload }) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = Array.from(e.target.files || []);
    if (uploadedFiles.length > 0) {
      onFileUpload(uploadedFiles);
    }
  };

  return (
    <div className="mb-4 p-4 bg-white rounded-lg shadow">
      <input
        type="file"
        accept="application/pdf"
        multiple
        onChange={handleFileChange}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-200 file:text-gray-700 hover:file:bg-gray-300"
      />
    </div>
  );
};

// Main Chat Layout Component
const HeadnoteGeneration: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentType[]>([]);
  const [showDocViewer, setShowDocViewer] = useState(false);
  const [history, setHistory] = useState<FileInfo[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [, setViewUrl] = useState<string>(""); // Add viewUrl state
  const [response, setResponse] = useState<string>("");
  const [, setBlobUrl] = useState<string | any>(null);
  const [, setLoading] = useState<boolean>(false);
  const [, setError] = useState<string | null>(null);
  const { showLoader, hideLoader } = useLoader();
  const { formatResponse } = useTextFormatter();
  const folderName = "headnote";
  // State for showing initial text
  const [showInitialText, setShowInitialText] = useState(true);
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(`http://44.211.157.24:8000/recent-files/${folderName}`);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data: FileInfo[] = await res.json();
        setHistory(data);
      } catch (err) {
        console.error("Failed to fetch history:", err);
      }
    };
    fetchHistory();
  }, []);


  const handleFileUpload = async (files: File[]) => {
    const uploadedDocs: DocumentType[] = [];
    showLoader("upload")
    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      uploadedDocs.push({
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        content: arrayBuffer,
      });
      await uploadDocument(file);

    }

    setDocuments((prevDocs) => [...prevDocs, ...uploadedDocs]);
    hideLoader("upload")
    // Hide initial text when document is uploaded
    setShowInitialText(false);
  };
  useEffect(() => {
    console.log("Updated documents:", documents);
  }, [documents]);

  const splitByPoints = (text: string) => {
    return text
      .split(/(?:\d+\.\s+|\•\s+|\-\s+|\*\s+)/)
      .filter((line) => line.trim() !== "");
  };

  const formattedResponse = splitByPoints(response);
  const uploadDocument = async (file: File) => {
    showLoader("upload")
    setLoading(true);
    setError(null);
    const fileUrl = URL.createObjectURL(file);
    setBlobUrl(fileUrl);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch('http://44.211.157.24:8000/headnote/', {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setResponse(data.headnote || "Generated headnote will appear here.");
      setViewUrl(data.view_url); // Store the view URL
    } catch (err) {
      setError("Failed to process document. Please try again.");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
    hideLoader("upload")
  };
  const initialTexts = [
    "Make it more simple and swift than ever to conduct legal research.",
    "This cutting-edge software enables legal practitioners to rapidly understand the salient",
    "features of a case. Extract and condense crucial information from complex legal documents.",
    "Begin by uploading your document and use Lex Genie AI to aid with Legal Head Note Creation.",
  ];


  return (
    <div className="flex flex-col bg-gray-100 text-black min-h-screen">
      <header className="border-b p-2 bg-white flex justify-between items-center">
        <Returnpage />
        <h1 className="text-xl font-semibold">Headnote Generator</h1>
        <div className="relative flex gap-2">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="px-4 py-2 bg-white text-black rounded-lg border border-black hover:bg-gray-200 focus:outline-none"
          >
            History
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg w-80 z-20">
              <div className="p-3 border-b flex justify-between items-center">
                <h3 className="font-medium">Recent Documents</h3>
                <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-gray-200 rounded-full">
                  ✖
                </button>
              </div>

              {history.length > 0 ? (
                <ul className="py-2 max-h-60 overflow-y-auto">
                  {history.map((file) => (
                    <li key={file.name} className="px-4 py-2 hover:bg-gray-100">
                      <a href={file.path} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {file.name}
                      </a>
                      <small className="block text-gray-500">
                        Last modified: {new Date(file.modified_time).toLocaleString()}
                      </small>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="p-4 text-gray-500 text-center">No recent files found.</p>
              )}
            </div>
          )}
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
        <div>

          <div>
            {formattedResponse.length > 0 ? (
              formattedResponse.map((point, index) => (
                <p className={`p-2 rounded-lg  ${response
                  ? "mr-auto bg-white "
                  : "ml-auto bg-white "
                  }`} style={{ width: '80vw' }} key={index}>{point}</p>
              ))
            ) : (
              <>{formatResponse(response)}</>
            )}
          </div>

        </div>
      </div>
      {showDocViewer && <DocumentViewer documents={documents} onClose={() => setShowDocViewer(false)} />}
    </div>
  );
};

export default HeadnoteGeneration;
