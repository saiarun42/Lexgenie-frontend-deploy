import React, { useState, useEffect } from "react";
import { FileText, X } from "lucide-react";

interface DocumentData {
  id: string;
  name: string;
  content: ArrayBuffer | null;
}

const DocumentViewer: React.FC<{ 
  documents?: DocumentData[]; 
  onClose: () => void 
}> = ({ 
  documents = [], // Provide default empty array
  onClose 
}) => {
  const [selectedDoc, setSelectedDoc] = useState<DocumentData | null>(null);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize selected document when documents prop changes
  useEffect(() => {
    if (documents.length > 0 && !selectedDoc) {
      setSelectedDoc(documents[0]);
    }
  }, [documents,selectedDoc]);

  useEffect(() => {
    if (selectedDoc?.content) {
      setLoading(true);
      setError(null);
      try {
        // Clean up previous object URL
        if (objectUrl) {
          URL.revokeObjectURL(objectUrl);
        }

        // Create new blob and object URL
        const blob = new Blob([selectedDoc.content], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setObjectUrl(url);
      } catch (err) {
        setError("Failed to load document");
        console.error("Error loading document:", err);
      } finally {
        setLoading(false);
      }
    }

    // Cleanup function
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [selectedDoc,objectUrl]);

  // If no documents are provided, show a message
  if (!documents.length) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Document Viewer</h2>
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-gray-100 rounded-full"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>
          <p className="text-gray-500">No documents available to view</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-11/12 h-5/6 flex flex-col p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Document Viewer</h2>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-100 rounded-full"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex h-full">
          {/* Sidebar - List of Documents */}
          <div className="w-1/5 border-r pr-4 overflow-y-auto">
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

          {/* Main Viewer */}
          <div className="flex-1 pl-4 flex flex-col">
            <div className="flex-1 overflow-hidden bg-gray-50 rounded">
              {loading ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  Loading document...
                </div>
              ) : error ? (
                <div className="flex items-center justify-center h-full text-red-500">
                  {error}
                </div>
              ) : objectUrl ? (
                <iframe
                  src={`${objectUrl}#toolbar=0`}
                  className="w-full h-full border-0"
                  title="PDF document viewer"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  Select a document to view
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentViewer;