import { createContext, useContext, ReactNode } from "react";

const formatText = (text: string): string => {
  return text
    .replace(/\b(loader)\b/gi, "<strong>$1</strong>") // Bold "loader"
    .replace(/\b(error|failed|warning)\b/gi, "<span style='color: red;'>$1</span>") // Red for errors
    .replace(/\b(success|done|completed)\b/gi, "<span style='color: green;'>$1</span>") // Green for success
    .replace(/\d+/g, "<span style='color: blue;'>$&</span>"); // Blue numbers
};

const formatResponse = (response: string) => {
  const lines = response.split("\n");

  return (
    <div className="response-format space-y-2">
      {lines.map((line, index) => {
        if (/^###\s/.test(line)) {
          return (
            <div key={index} className="font-bold text-lg text-purple-700">
              {line.replace(/^###\s/, "")}
            </div>
          );
        } else if (/^####\s/.test(line)) {
          return (
            <div key={index} className="font-semibold text-blue-600">
              {line.replace(/^####\s/, "")}
            </div>
          );
        } else {
          const linkRegex = /(https?:\/\/[^\s]+)/g;
          const parts = line.split(linkRegex);

          return (
            <div key={index} className="text-gray-700">
              {parts.map((part, partIndex) => {
                if (linkRegex.test(part)) {
                  return (
                    <a
                      key={partIndex}
                      href={part.replace(/[.,)]+$/, "")}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 underline"
                    >
                      {part}
                    </a>
                  );
                }

                const boldParts = part.split(/(\*\*.*?\*\*)/g);
                return boldParts.map((boldPart, boldIndex) => {
                  if (/^\*\*.*\*\*$/.test(boldPart)) {
                    return <strong key={boldIndex}>{boldPart.slice(2, -2)}</strong>;
                  }
                  return boldPart;
                });
              })}
            </div>
          );
        }
      })}
    </div>
  );
};

const TextFormatterContext = createContext({ formatText, formatResponse });

export const TextFormatterProvider = ({ children }: { children: ReactNode }) => {
  return (
    <TextFormatterContext.Provider value={{ formatText, formatResponse }}>
      {children}
    </TextFormatterContext.Provider>
  );
};

export const useTextFormatter = () => useContext(TextFormatterContext);
