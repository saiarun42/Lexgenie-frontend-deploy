

"use client"
import React, { useState } from 'react';
import { Eye, FileText, Loader, X, } from 'lucide-react';
import Returnpage from './returnpage';
import { useTextFormatter } from '@/context/TextFormatterContext';
import Mammoth from 'mammoth';


// UUID Generator function for cross-browser compatibility
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
type ChatMessage = {
    text: string;
    fromUser: boolean;
};
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

const Layout: React.FC = () => {
    const [fileV1, setFileV1] = useState<File | null>(null);
    const [fileV2, setFileV2] = useState<File | null>(null);
    const [, setChangesSummary] = useState<string | null>(null);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [loading, setLoading] = useState(false); // for preloader state
    const { formatResponse } = useTextFormatter();
    const [showDocViewer, setShowDocViewer] = useState(false);
    const [documents, setDocuments] = useState<DocumentType[]>([]);
    const handleFileV1Change = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setFileV1(event.target.files[0]);
        }
    };

    const handleFileV2Change = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setFileV2(event.target.files[0]);
        }
    };

    const handleCompare = async () => {
        if (!fileV1 || !fileV2) {
          alert("Please select both files first");
          return;
        }
    
        const formData = new FormData();
        formData.append("file_v1", fileV1);
        formData.append("file_v2", fileV2);
    
        setLoading(true);
    
        try {
          const res = await fetch("http://44.211.157.24:8000/compare-contracts", {
            method: "POST",
            body: formData,
          });
    
          if (!res.ok) throw new Error("Failed to compare files");
    
          const data = await res.json();
          setChangesSummary(data.changes_summary);
          setChatMessages((prevMessages) => [
            ...prevMessages,
            { text: data.changes_summary, fromUser: false },
          ]);
    
          [fileV1, fileV2].forEach((file) => {
            if (!file) return;
    
            let fileUrl: string | null = null;
    
            if (file.type === "application/pdf") {
              fileUrl = URL.createObjectURL(file);
            } else if (file.name.endsWith(".docx")) {
              const reader = new FileReader();
              reader.onload = async (event) => {
                const arrayBuffer = event.target?.result as ArrayBuffer;
                const { value } = await Mammoth.convertToHtml({ arrayBuffer });
                // setDocuments((prevDocs) => [...prevDocs, { id: crypto.randomUUID(), name: file.name, content: value, file }]);
                setDocuments((prevDocs) => [...prevDocs, { id: generateUUID(), name: file.name, content: value, file }]);
              };

              reader.readAsArrayBuffer(file);
              return;
            } else if (file.name.endsWith(".doc")) {
              alert("DOC files are not supported for direct preview. Please convert to DOCX or PDF.");
              return;
            } else if (file.type.startsWith("text/")) {
              const reader = new FileReader();
              reader.onload = (e) => {
                fileUrl = e.target?.result as string;
                // setDocuments((prevDocs) => [...prevDocs, { id: crypto.randomUUID(), name: file.name, content: fileUrl, file }]);
                setDocuments((prevDocs) => [...prevDocs, { id: generateUUID(), name: file.name, content: fileUrl, file }]);
              };
              reader.readAsText(file);
              return;
            } else {
              alert("Unsupported file format. Please upload a PDF, DOCX, or TXT file.");
              return;
            }
    
            if (fileUrl) {
              setDocuments((prevDocs) => [...prevDocs, { id: crypto.randomUUID(), name: file.name, content: fileUrl, file }]);
            }
          });
        } catch (error) {
          console.error("Error comparing files:", error);
        } finally {
          setLoading(false);
        }
      };

   

    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Left Panel: Compare Contracts */}
            <div className="w-1/5 p-4 bg-white border-r border-gray-300">
            <Returnpage/>
                <h2 className="text-xl font-bold mb-4">Compare Contracts</h2>
                <div className="mb-6">
                    <h3 className="mb-2">Upload Contract V1</h3>
                    <input
                        type="file"
                        onChange={handleFileV1Change}
                        className="border p-2 mb-4 w-full"
                    />
                    <h3 className="mb-2">Upload Contract V2</h3>
                    <input
                        type="file"
                        onChange={handleFileV2Change}
                        className="border p-2 mb-4 w-full"
                    />
                    <button
                        onClick={handleCompare}
                        className="w-full bg-black text-white p-2 rounded hover:bg-gray-600"
                    >
                        Compare Contracts
                    </button>
                </div>
            </div>

            {/* Right Panel: Chat Window & History */}
            <div className="w-4/5 p-4 flex flex-col">
                <div className="flex-grow bg-white p-4 mb-4 border rounded-md">
                    <h2 className="text-xl font-bold mb-2">Compare Contract</h2>
                    {documents.length > 0 && (
                        <button
                            onClick={() => setShowDocViewer(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                        >
                            <Eye size={16} />
                            View Documents
                        </button>
                    )}
                    <div className="h-96 overflow-y-scroll bg-gray-50 p-2 rounded-lg mb-4">
                        {chatMessages.map((msg, index) => (
                            <div
                                key={index}
                                className={`p-2 mb-2 ${
                                    msg.fromUser ? 'bg-blue-100' : 'bg-gray-200'
                                } rounded`}
                            >
                              <>{formatResponse(msg.text)}</> 
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-center p-2 mb-2">
                                <Loader className="animate-spin text-blue-500" />
                            </div>
                        )}
                    </div>
                    {showDocViewer && (
                        <DocumentViewer
                            documents={documents}
                            onClose={() => setShowDocViewer(false)}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default Layout;
