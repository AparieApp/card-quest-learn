
import { useCallback } from 'react';
import { useGameError } from './useGameError';
import { useReviewMode } from './useReviewMode';
import { GameMode } from '@/types/game';
import { Flashcard } from '@/types/deck';

interface PracticeControlsProps {
  mode: GameMode;
  setState: Function;
  shuffleArray: <T>(array: T[]) => T[];
}

export const usePracticeControls = ({ mode, setState, shuffleArray }: PracticeControlsProps) => {
  const { handleGameError } = useGameError();
  const startReviewMode = useReviewMode(setState);
  
  const endPractice = useCallback(() => {
    try {
      setState(prev => ({
        ...prev,
        showSummary: true
      }));
    } catch (error) {
      handleGameError(error, 'end practice');
    }
  }, [setState, handleGameError]);
  
  const endReviewMode = useCallback(() => {
    try {
      setState(prev => ({
        ...prev,
        showSummary: true
      }));
    } catch (error) {
      handleGameError(error, 'end review mode');
    }
  }, [setState, handleGameError]);
  
  const continuePractice = useCallback(() => {
    try {
      setState(prev => ({
        ...prev,
        showSummary: false
      }));
    } catch (error) {
      handleGameError(error, 'continue practice');
    }
  }, [setState, handleGameError]);
  
  const restartPractice = useCallback(() => {
    try {
      setState(prev => {
        // Shuffle the cards for a fresh start
        const shuffledCards = shuffleArray(prev.cards);
        
        return {
          ...prev,
          currentCardIndex: 0,
          isReviewMode: false,
          showSummary: false,
          showRemovePrompt: false,
          currentCycle: 1,
          completedCycles: [],
          stats: {
            initialCorrect: 0,
            overallCorrect: 0,
            totalAttempts: 0,
          },
          incorrectCards: [],
          reviewCards: [],
          currentCardStreak: {},
        };
      });
    } catch (error) {
      handleGameError(error, 'restart practice');
    }
  }, [setState, handleGameError, shuffleArray]);
  
  return {
    endPractice,
    endReviewMode,
    continuePractice,
    restartPractice,
    startReviewMode
  };
};
