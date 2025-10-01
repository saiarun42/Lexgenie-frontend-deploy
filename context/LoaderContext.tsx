import { createContext, useContext, useState, ReactNode } from "react";
import Loader from "@/components/common/Loader"; // ✅ Imported but not used yet

interface LoaderContextType {
  showLoader: (key: string) => void;
  hideLoader: (key: string) => void;
  loadingSections: { [key: string]: boolean };
}

const LoaderContext = createContext<LoaderContextType | undefined>(undefined);

export const LoaderProvider = ({ children }: { children: ReactNode }) => {
  const [loadingSections, setLoadingSections] = useState<{ [key: string]: boolean }>({});

  const showLoader = (key: string) => {
    setLoadingSections((prev) => ({ ...prev, [key]: true }));
  };

  const hideLoader = (key: string) => {
    setLoadingSections((prev) => ({ ...prev, [key]: false }));
  };

  // ✅ Check if any loader is active
  const isLoading = Object.values(loadingSections).some((loading) => loading);

  return (
    <LoaderContext.Provider value={{ showLoader, hideLoader, loadingSections }}>
      {/* ✅ Show Loader when any section is loading */}
      {isLoading && <Loader />}  

      {children}
    </LoaderContext.Provider>
  );
};

export const useLoader = () => {
  const context = useContext(LoaderContext);
  if (!context) {
    throw new Error("useLoader must be used within a LoaderProvider");
  }
  return context;
};
