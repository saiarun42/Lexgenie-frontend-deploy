// utils/documentUtils.ts
import mammoth from "mammoth";
import * as PDFJS from 'pdfjs-dist';

// Initialize PDF.js worker
PDFJS.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs`;

export const extractTextFromFile = async (file: File): Promise<string> => {
  const fileType = file.name.split('.').pop()?.toLowerCase();

  switch (fileType) {
    case 'txt':
      return await readTxtFile(file);
    
    case 'docx':
      return await readDocxFile(file);
    
    case 'pdf':
      return await readPdfFile(file);
    
    case 'doc':
      throw new Error('DOC format is not supported. Please convert to DOCX.');
    
    default:
      throw new Error('Unsupported file format. Please upload TXT, DOCX, or PDF files.');
  }
};

const readTxtFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = () => reject(new Error('Error reading text file'));
    reader.readAsText(file);
  });
};

const readDocxFile = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
};

const readPdfFile = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFJS.getDocument({ data: arrayBuffer }).promise;
  
  let fullText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item: any) => item.str).join(' ');
    fullText += pageText + '\n';
  }
  
  return fullText;
};

export const analyzeText = (text: string) => {
  const newSuggestions: any[] = [];
  const newIssues = { grammar: 0, punctuation: 0, terminology: 0, citation: 0 };

  // Simple grammar checks
  const sentences = text.split(/[.!?]+/);
  sentences.forEach((sentence) => {
    // Double words
    const words = sentence.trim().split(/\s+/);
    words.forEach((word, wordIdx) => {
      if (word === words[wordIdx - 1]) {
        newSuggestions.push({
          text: `${word} ${word}`,
          replacement: word,
          type: "grammar",
          index: text.indexOf(`${word} ${word}`)
        });
        newIssues.grammar++;
      }
    });

    // Missing capitalization
    if (sentence.trim().length > 0 && sentence.trim()[0] !== sentence.trim()[0].toUpperCase()) {
      newSuggestions.push({
        text: sentence.trim(),
        replacement: sentence.trim()[0].toUpperCase() + sentence.trim().slice(1),
        type: "grammar",
        index: text.indexOf(sentence.trim())
      });
      newIssues.grammar++;
    }
  });

  // Simple punctuation checks
  const matches = text.match(/\s+[,.!?]/g) || [];
  matches.forEach(match => {
    newSuggestions.push({
      text: match,
      replacement: match.trim(),
      type: "punctuation",
      index: text.indexOf(match)
    });
    newIssues.punctuation++;
  });

  // Legal terminology checks (simplified example)
  const legalTerms = {
    'due to': 'because of',
    'prior to': 'before',
    'subsequent to': 'after',
    'in order to': 'to'
  };

  Object.entries(legalTerms).forEach(([term, suggestion]) => {
    const regex = new RegExp(term, 'gi');
    let match;
    while ((match = regex.exec(text)) !== null) {
      newSuggestions.push({
        text: match[0],
        replacement: suggestion,
        type: "terminology",
        index: match.index
      });
      newIssues.terminology++;
    }
  });

  return { suggestions: newSuggestions, issues: newIssues };
};

export const generateHighlightedContent = (content: string, suggestions: any[], currentSuggestionIndex: number) => {
  if (!content) return "";
  
  // Create a copy of the content for highlighting
  let highlightedHTML = content;
  
  // Process suggestions in reverse order (from end to start)
  // to avoid index shifting issues when we insert HTML
  const sortedSuggestions = [...suggestions].sort((a, b) => b.index - a.index);
  
  sortedSuggestions.forEach((suggestion, idx) => {
    const isCurrent = suggestions.indexOf(suggestion) === currentSuggestionIndex;
    const start = suggestion.index;
    const end = suggestion.index + suggestion.text.length;
    
    // Get color based on issue type
    let color = "red";
    switch (suggestion.type) {
      case "grammar":
        color = "blue";
        break;
      case "punctuation":
        color = "green";
        break;
      case "terminology":
        color = "orange";
        break;
      case "citation":
        color = "red";
        break;
    }
    
    // Add highlight with appropriate color
    // Make current suggestion more prominent
    const highlightClass = isCurrent 
      ? `background-color: ${color}; color: white; padding: 2px; border-radius: 2px;` 
      : `border-bottom: 2px solid ${color};`;
    
    const before = highlightedHTML.substring(0, start);
    const target = highlightedHTML.substring(start, end);
    const after = highlightedHTML.substring(end);
    
    highlightedHTML = `${before}<span style="${highlightClass}" data-suggestion-index="${idx}">${target}</span>${after}`;
  });
  
  return highlightedHTML;
};