import React, { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

interface SelectedCoordinate {
  x: number;
  y: number;
  z: number;
}

interface MRIContextType {
  currentSliceURL: string;
  setCurrentSliceURL: React.Dispatch<React.SetStateAction<string>>;
  imageData: ImageData | null;
  setImageData: React.Dispatch<React.SetStateAction<ImageData | null>>;
  selectedCoordinates: SelectedCoordinate[];
  setSelectedCoordinates: React.Dispatch<
    React.SetStateAction<SelectedCoordinate[]>
  >;
}

const MRIContext = createContext<MRIContextType | undefined>(undefined);

interface MRIProviderProps {
  children: ReactNode;
}

export const MRIProvider: React.FC<MRIProviderProps> = ({ children }) => {
  const [currentSliceURL, setCurrentSliceURL] = useState<string>("");
  const [imageData, setImageData] = useState<ImageData | null>(null);
  const [selectedCoordinates, setSelectedCoordinates] = useState<
    SelectedCoordinate[]
  >([]); // initialize as empty array

  return (
    <MRIContext.Provider
      value={{
        imageData,
        currentSliceURL,
        selectedCoordinates,
        setImageData,
        setCurrentSliceURL,
        setSelectedCoordinates,
      }}
    >
      {children}
    </MRIContext.Provider>
  );
};

export const useMRI = (): MRIContextType => {
  const context = useContext(MRIContext);
  if (!context) {
    throw new Error("useMRI must be used within an MRIProvider");
  }
  return context;
};
