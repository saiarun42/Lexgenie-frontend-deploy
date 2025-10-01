


"use client";
import { useState, useRef } from "react";
import axios from "axios";
import Returnpage from "./returnpage";
import { useTextFormatter } from "@/context/TextFormatterContext";
import Mammoth from 'mammoth';
import { Eye, FileText, X } from "lucide-react";
// UUID Generator function for cross-browser compatibility
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
  });
}
interface DocumentType {
  id: string;
  name: string;
  content: string | null; // Changed to string for URL
  file?: File;  // Added to store the original file
}

const DocumentViewer: React.FC<{ documents: DocumentType[]; onClose: () => void }> = ({
  documents = [],
  onClose
}) => {
  const [selectedDoc, setSelectedDoc] = useState<DocumentType | null>(null);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ">
      <div className="bg-white rounded-lg w-3/4 h-full flex flex-col p-4 my-6">
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
                className={`p-2 cursor-pointer hover:bg-gray-100 rounded flex items-center ${selectedDoc?.id === doc.id ? "bg-gray-200" : ""}`}
              >
                <FileText size={16} className="mr-2 shrink-0" />
                <span className="truncate">{doc.name}</span>
              </div>
            ))}
          </div>
          <div className="flex-1 pl-4 overflow-hidden">
            {selectedDoc ? (
              selectedDoc.content ? (
                selectedDoc.file?.type === 'application/pdf' ? (
                  <embed src={selectedDoc.content} className="w-full h-full" type="application/pdf" />
                ) : (
                  <div dangerouslySetInnerHTML={{ __html: selectedDoc.content }}
                    className="p-4 overflow-auto bg-gray-100 border rounded-md h-full whitespace-pre-wrap">
                  </div>
                )
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
const ClauseRecommender = () => {
  const [contractType, setContractType] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [recommendedClauses, setRecommendedClauses] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { formatResponse } = useTextFormatter();
  const [showDocViewer, setShowDocViewer] = useState(false);
  const [documents, setDocuments] = useState<DocumentType[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      setError("Please upload a contract document file");
      return;
    }

    setLoading(true);
    setError("");
    setRecommendedClauses([]); // Clear previous results

    try {
      // Create FormData to send the file and contract type
      const formData = new FormData();
      formData.append("file", file);

      // Send the contract_type as a query parameter
      const url = `http://44.211.157.24:8000/recommend-clauses?contract_type=${encodeURIComponent(contractType)}`;

      const response = await axios.post(
        url,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          },
        }
      );

      console.log("API Response:", response.data); // Debugging log

      // Extract the clause text from the nested response structure
      if (response.data && response.data.additional_clauses && response.data.additional_clauses.clause) {
        const clauseText = response.data.additional_clauses.clause;

        // Split the numbered clauses into an array
        // This regex looks for numbered patterns like "1. ", "2. ", etc.
        const clausesArray = clauseText
          .split(/\d+\.\s+\*\*[^*]+\*\*:/)
          .filter((item: string) => item.trim())
          .map((item: string) => item.trim());

        // If the split didn't work as expected or returned empty, 
        // fall back to splitting by new lines
        if (clausesArray.length === 0) {
          const fallbackArray = clauseText
            .split("\n\n")
            .filter((item: string) => item.trim());

          setRecommendedClauses(fallbackArray);
        } else {
          setRecommendedClauses(clausesArray);
        }
      } else {
        setError("No clause recommendations were found in the response");
      }
      let fileUrl: string | null = null;

        if (file.type === 'application/pdf') {
            // Create URL for PDF preview
            fileUrl = URL.createObjectURL(file);
        } else if (file.name.endsWith('.docx')) {
            // Convert DOCX to HTML/Text using Mammoth
            const reader = new FileReader();
            reader.onload = async (event) => {
                const arrayBuffer = event.target?.result as ArrayBuffer;
                const { value } = await Mammoth.convertToHtml({ arrayBuffer });
                setDocuments((prevDocs) => [...prevDocs, { id: generateUUID(), name: file.name, content: value, file }]);
            };
            reader.readAsArrayBuffer(file);
            return;
        } else if (file.name.endsWith('.doc')) {
            alert('DOC files are not supported for direct preview. Please convert to DOCX or PDF.');
            return;
        } else if (file.type.startsWith('text/')) {
            // Handle TXT or plain text files
            const reader = new FileReader();
            reader.onload = (e) => {
                fileUrl = e.target?.result as string;
                setDocuments((prevDocs) => [...prevDocs, { id: crypto.randomUUID(), name: file.name, content: fileUrl, file }]);
            };
            reader.readAsText(file);
            return;
        } else {
            alert('Unsupported file format. Please upload a PDF, DOCX, or TXT file.');
            return;
        }

        if (fileUrl) {
            setDocuments((prevDocs) => [...prevDocs, { id: crypto.randomUUID(), name: file.name, content: fileUrl, file }]);
        }
    } catch (err: any) {
      console.error("API Error:", err);

      if (err.response) {
        console.error("Response data:", err.response.data);
        console.error("Response status:", err.response.status);

        const errorDetail = err.response.data?.detail || "Failed to fetch recommended clauses.";
        setError(
          typeof errorDetail === 'string'
            ? errorDetail
            : JSON.stringify(errorDetail)
        );
      } else if (err.request) {
        setError("No response received from server. Please check your connection.");
      } else {
        setError(`Error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full mx-auto flex h-screen bg-gray-100 p-6">
      {/* Left Side - Form (1/5 width) */}
      <div className="w-1/5 bg-white p-4 shadow-lg rounded-lg">
        <Returnpage />
        <h2 className="text-xl font-bold text-gray-800 mb-4">Recommend Clauses</h2>
       
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Contract Type Input */}
          <div>
            <label className="block text-gray-700 font-medium">Contract Type</label>
            <input
              type="text"
              value={contractType}
              onChange={(e) => setContractType(e.target.value)}
              className="w-full border p-2 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter contract type (e.g., NDA, Lease)"
              required
            />
          </div>

          {/* File Upload Input */}
          <div>
            <label className="block text-gray-700 font-medium">Upload Contract Document</label>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              className="w-full border p-2 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
              accept=".txt,.doc,.docx,.pdf"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Supported formats: .txt, .doc, .docx, .pdf
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded hover:bg-gray-600 transition"
            disabled={loading}
          >
            {loading ? "Analyzing..." : "Get Recommended Clauses"}
          </button>
        </form>
      </div>

      {/* Right Side - Response (4/5 width) */}
      <div className="w-4/5 bg-white p-6 ml-6 shadow-lg rounded-lg overflow-y-auto">
        <h3 className="text-2xl font-bold text-gray-800 mb-4">Recommended Clauses</h3>
        {documents.length > 0 && (
                        <button
                            onClick={() => setShowDocViewer(true)}
                            className="flex items-center my-2 gap-2 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                        >
                            <Eye size={16} />
                            View Documents
                        </button>
                    )}
        {/* Error Message */}
        {error && (
          <div className="p-4 mb-4 bg-red-50 border-l-4 border-red-500 text-red-700">
            <p className="font-medium">Error:</p>
            <p>{error}</p>
          </div>
        )}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="ml-4 text-gray-600">Analyzing your contract...</p>
          </div>
        )}

        {/* Display Raw Response for Debugging */}
        {/*
        <div className="mb-4 p-4 bg-gray-100 rounded text-xs overflow-auto max-h-40">
          <pre>Debug Response: {JSON.stringify(recommendedClauses, null, 2)}</pre>
        </div>
        */}

        {/* Display Recommended Clauses */}
        {!loading && recommendedClauses.length > 0 ? (
          <ul className="space-y-6 text-gray-700">
            {recommendedClauses.map((clause, index) => (
              <li key={index} className="p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-200" style={{ listStyle: "none" }}>
                <p className="font-bold text-lg text-blue-700 mb-2">Clause {index + 1}</p>
                <div className="prose max-w-none">
                  <>{formatResponse(`**${clause.replace(/^\s*:\s*/, '')}**`)}</>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          !loading && !error && (
            <p className="text-gray-500">
              Upload a contract document to receive clause recommendations.
            </p>
          )
        )}

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

export default ClauseRecommender;