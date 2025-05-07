import { useState, useEffect, useCallback } from 'react';

const LOCAL_STORAGE_KEY = 'showEditDeckImages';

export const useEditDeckImageToggle = () => {
  const [showImages, setShowImages] = useState<boolean>(() => {
    const storedValue = localStorage.getItem(LOCAL_STORAGE_KEY);
    return storedValue ? JSON.parse(storedValue) : true; // Default to true (show images)
  });

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(showImages));
  }, [showImages]);

  const toggleShowImages = useCallback(() => {
    setShowImages(prev => !prev);
  }, []);

  return { showImages, toggleShowImages };
}; 