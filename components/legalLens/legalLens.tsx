"use client";
import React, { useState, useRef, } from 'react';
import { Upload, AlertCircle, Check, X, Edit, ChevronDown, ChevronRight } from 'lucide-react';
import type { NextPage } from 'next';
// import * as Mammoth from "mammoth";
import * as PDFJS from 'pdfjs-dist';
import Returnpage from '../returnpage';

// Updated Types definition
type IssueType = 'grammar' | 'punctuation' | 'terminology' | 'citation';
// type ActionType = 'accept' | 'ignore' | 'modify';

interface Issue {
  id: string;
  text: string;
  suggestion: string;
  type: IssueType;
  start: number;
  end: number;
  details: string | string[];  // Allow both string and string[]

}

interface ProofreadReport {
  proofread_report?: {
    proofread_analysis: string;
    error_counts?: {
      [key: string]: number;
    };
    grammar_errors?: string[];
    punctuation_errors?: string[];
    legal_terminology_errors?: string[];
    citation_formatting_errors?: string[];
  };
  document_id?: string;
}

// Configure PDF.js worker
PDFJS.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs`;

const Home: NextPage = () => {
  const [text, setText] = useState<string>('');
  const [, setIssues] = useState<Issue[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [, setDocumentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [editedSuggestion, setEditedSuggestion] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  // const [errorCounts, setErrorCounts] = useState<{ [key: string]: number }>({});
  const [errorDetails, setErrorDetails] = useState<{ [key: string]: string[] }>({});
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({});

  // Existing file extraction methods remain the same...
  const errorTypeMapping: { [key: string]: IssueType } = {
    'Grammar Errors': 'grammar',
    'Punctuation Errors': 'punctuation',
    'Legal Terminology Errors': 'terminology',
    'Citation Formatting Errors': 'citation'
  };


  // File extraction helper functions
  // const extractTextFromDocx = async (file: File): Promise<string> => {
  //   return new Promise((resolve, reject) => {
  //     const reader = new FileReader();
  //     reader.onload = async (event) => {
  //       try {
  //         const arrayBuffer = event.target?.result as ArrayBuffer;
  //         const result = await Mammoth.extractRawText({ arrayBuffer });
  //         resolve(result.value);
  //       } catch (error) {
  //         reject(error);
  //       }
  //     };
  //     reader.onerror = reject;
  //     reader.readAsArrayBuffer(file);
  //   });
  // };

  // const extractTextFromPDF = async (file: File): Promise<string> => {
  //   return new Promise((resolve, reject) => {
  //     const reader = new FileReader();
  //     reader.onload = async (event) => {
  //       try {
  //         const arrayBuffer = event.target?.result as ArrayBuffer;
  //         const pdf = await PDFJS.getDocument({ data: arrayBuffer }).promise;

  //         let extractedText = "";
  //         for (let i = 1; i <= pdf.numPages; i++) {
  //           const page = await pdf.getPage(i);
  //           const textContent = await page.getTextContent();
  //           const pageText = textContent.items.map((item) => (item as any).str).join(" ");
  //           extractedText += pageText + "\n\n";
  //         }

  //         resolve(extractedText);
  //       } catch (error) {
  //         reject(error);
  //       }
  //     };
  //     reader.onerror = reject;
  //     reader.readAsArrayBuffer(file);
  //   });
  // };

  // Handle file upload 
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://13.61.2.47:80/legal-lens', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ProofreadReport = await response.json();

      const extractedText = data.proofread_report?.proofread_analysis || '';
      setText(extractedText);
      setDocumentId(data.document_id || null);

      // Collect error details
      const errorDetailsMap: { [key: string]: string[] } = {
        'Grammar Errors': data.proofread_report?.grammar_errors || [],
        'Punctuation Errors': data.proofread_report?.punctuation_errors || [],
        'Legal Terminology Errors': data.proofread_report?.legal_terminology_errors || [],
        'Citation Formatting Errors': data.proofread_report?.citation_formatting_errors || []
      };
      setErrorDetails(errorDetailsMap);

      // Create issues from the analysis
      const allIssues: Issue[] = Object.entries(errorDetailsMap).flatMap(([type, errors]) =>
        errors.map((error, index) => ({
          id: `${type}-${index}`,
          text: error,
          suggestion: error,
          type: errorTypeMapping[type],
          start: 0,
          end: error.length,
          details: [error]
        }))
      );
      setIssues(allIssues);

    } catch (error) {
      console.error('Error uploading file:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
      setIssues([]);
      setErrorDetails({});
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle section expansion
  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };



  // Color mapping for issue types
  const getIssueColor = (type: IssueType): string => {
    const colorMap: Record<IssueType, string> = {
      'grammar': 'bg-red-200',
      'punctuation': 'bg-yellow-200',
      'terminology': 'bg-blue-200',
      'citation': 'bg-purple-200'
    };
    return colorMap[type] || 'bg-gray-200';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-4">
      <Returnpage  />
        <h1 className="text-2xl font-bold mb-6 text-center">Legal Lens Proofreading Tool</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Document Upload Section */}
          <div className="lg:col-span-5 bg-white p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Document</h2>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              accept=".txt,.doc,.docx,.pdf"
              disabled={isLoading}
            />
            <button
              className="w-full flex items-center justify-center gap-2 bg-gray-500 hover:bg--600 text-white py-2 px-4 rounded disabled:opacity-50"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
            >
              <Upload size={18} />
              {isLoading ? 'Processing...' : 'Upload Document'}
            </button>
          </div>

          {/* Text Area Section */}
          <div className="lg:col-span-4 bg-white p-4 rounded-lg shadow">
            <textarea
              className="w-full h-64 p-4 border rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-50"
              placeholder="Type or paste your text here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={isLoading}
            ></textarea>
          </div>

          {/* Issues and Suggestions Section */}
          <div className="lg:col-span-1 bg-white rounded-lg shadow">
            {/* Issue Summary */}
            {/* <div className="p-4 border-b">
              <h2 className="text-lg font-semibold mb-4">Issue Summary</h2>
              <div className="space-y-2">
                {Object.entries(errorTypeMapping).map(([backendType, issueType]) => (
                  <div key={backendType} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getIssueColor(issueType)}`}></div>
                    <span className="flex-grow">
                      {backendType.replace(' Errors', '')}
                    </span>
                    <span className="font-semibold">
                      {errorCounts[backendType] || 0}
                    </span>
                  </div>
                ))}
              </div>
            </div> */}
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold mb-4">Issue Summary</h2>
              <div className="space-y-2">
                {Object.entries(errorTypeMapping).map(([backendType, issueType]) => (
                  <div key={backendType} className="group">
                    <div
                      className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1 rounded"
                      onClick={() => toggleSection(backendType)}
                    >
                      <div className={`w-3 h-3 rounded-full ${getIssueColor(issueType)}`}></div>
                      <span className="flex-grow">
                        {backendType.replace(' Errors', '')}
                      </span>
                      <span className="font-semibold">
                        {errorDetails[backendType]?.length || 0}
                      </span>
                      {expandedSections[backendType] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </div>

                    {expandedSections[backendType] && (
                      <div className="pl-6 mt-2 space-y-2 text-sm text-gray-700">
                        {errorDetails[backendType]?.map((error, index) => (
                          <div
                            key={index}
                            className="cursor-pointer hover:bg-gray-50 p-1 rounded"
                            onClick={() => {
                              const issue: Issue = {
                                id: `${backendType}-${index}`,
                                text: error,
                                suggestion: error,
                                type: issueType,
                                start: 0,
                                end: error.length,
                                details: [error]
                              };
                              setSelectedIssue(issue);
                            }}
                          >
                            {error}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            {/* Current Suggestion */}
            <div className="p-4">
              <h2 className="text-lg font-semibold mb-4">Current Suggestion</h2>
              {selectedIssue ? (
                <div>
                  <div className="mb-4">
                    <div className="text-sm text-gray-500">Original:</div>
                    <div className="p-2 bg-gray-100 rounded">{selectedIssue.text}</div>
                  </div>

                  <div className="mb-4">
                    <div className="text-sm text-gray-500">Suggestion:</div>
                    <div className="p-2 bg-green-100 rounded">{selectedIssue.suggestion}</div>
                  </div>

                  <div className="mb-4">
                    <textarea
                      className="w-full p-2 border rounded"
                      placeholder="Modify suggestion (optional)"
                      value={editedSuggestion}
                      onChange={(e) => setEditedSuggestion(e.target.value)}
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded text-sm disabled:opacity-50"
                      onClick={() => {/* handleSuggestionAction */ }}
                      disabled={isLoading}
                    >
                      <Check size={16} />
                      Accept
                    </button>
                    <button
                      className="flex items-center gap-1 bg-gray-500 hover:bg-gray-600 text-white py-1 px-3 rounded text-sm disabled:opacity-50"
                      onClick={() => {/* handleSuggestionAction */ }}
                      disabled={isLoading}
                    >
                      <X size={16} />
                      Ignore
                    </button>
                    <button
                      className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded text-sm disabled:opacity-50"
                      onClick={() => {/* handleSuggestionAction */ }}
                      disabled={isLoading}
                    >
                      <Edit size={16} />
                      Modify
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-32 text-gray-400">
                  <div className="text-center">
                    <AlertCircle size={24} className="mx-auto mb-2" />
                    <p>Select an issue to see suggestions</p>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;