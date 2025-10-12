import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, RotateCcw } from 'lucide-react';
import "./GamePlayWordFormedPointAwarded.css";
import { GameToastModal } from '../../../../components/Jumbo-Jester';
import { useSoundManager } from '../../../../hooks/SoundManager';
import { useTelegramWebApp } from '../../../../hooks/TelegramProvider';
import { useUser } from '../../../../hooks/UserProvider';
import { threeLetterWords, fourLetterWords,fiveLetterWords,sixLetterWords,sevenLetterWords } from '../../../../components/Jumbo-Jester/words';
// Updated word fetching function that always uses fixed positions
// Modified fetchRandomThreeLetterWords function to adjust grid sizes
export const fetchRandomThreeLetterWords = async (level = 1, usedWordsSet = new Set()) => {
  try {
    // Define constraints
    const minSize = 3;
    const maxSize = 7;

    // Calculate grid sizes based on level with your specific progression
    let row1Length, row2Length, row3Length;

    // Level 1: 3-3-3
    // Level 2: 3-4-3
    // Level 3: 3-4-4
    // Level 4: 4-4-4
    // Level 5: 4-5-4
    // Level 6: 4-5-5
    // Level 7: 5-5-5
    // Level 8: 5-6-5
    // Level 9: 5-6-6
    // Level 10: 6-6-6
    // Continue pattern until reaching 7-7-7

    const progressionPattern = [
      [3, 3, 3], // Level 1
      [3, 4, 3], // Level 2
      [3, 4, 4], // Level 3
      [4, 4, 4], // Level 4
      [4, 5, 4], // Level 5
      [4, 5, 5], // Level 6
      [5, 5, 5], // Level 7
      [5, 6, 5], // Level 8
      [5, 6, 6], // Level 9
      [6, 6, 6], // Level 10
      [6, 7, 6], // Level 11
      [6, 7, 7], // Level 12
      [7, 7, 7], // Level 13+
    ];

    // Get grid layout based on level
    const patternIndex = Math.min(level - 1, progressionPattern.length - 1);
    [row1Length, row2Length, row3Length] = progressionPattern[patternIndex];

    const totalCells = row1Length + row2Length + row3Length;
    console.log(`Grid layout: ${row1Length}-${row2Length}-${row3Length} (${totalCells} cells) for level ${level}`);

    // Get word arrays based on length
    const getWordArrayByLength = (length) => {
      switch (length) {
        case 3: return threeLetterWords;
        case 4: return fourLetterWords;
        case 5: return fiveLetterWords;
        case 6: return sixLetterWords;
        case 7: return sevenLetterWords;
        default: return threeLetterWords;
      }
    };

    // Function to get random word that hasn't been used
    const getRandomUnusedWord = (length, usedSet) => {
      const wordArray = getWordArrayByLength(length);
      const availableWords = wordArray.filter(word => !usedSet.has(word.toUpperCase()));
      
      if (availableWords.length === 0) {
        throw new Error(`No available words of length ${length}`);
      }
      
      return availableWords[Math.floor(Math.random() * availableWords.length)].toUpperCase();
    };

    // Get three unique words for the grid
    const word1 = getRandomUnusedWord(row1Length, usedWordsSet);
    usedWordsSet.add(word1);
    
    const word2 = getRandomUnusedWord(row2Length, usedWordsSet);
    usedWordsSet.add(word2);
    
    const word3 = getRandomUnusedWord(row3Length, usedWordsSet);
    usedWordsSet.add(word3);

    const fixedPositions = [
      Array.from({ length: row1Length }, (_, i) => i),
      Array.from({ length: row2Length }, (_, i) => i + row1Length),
      Array.from({ length: row3Length }, (_, i) => i + row1Length + row2Length)
    ];

    const wordsWithPositions = [
      { word: word1, positions: fixedPositions[0] },
      { word: word2, positions: fixedPositions[1] },
      { word: word3, positions: fixedPositions[2] }
    ];

    console.log("Words with positions:", wordsWithPositions);

    return {
      words: wordsWithPositions,
      gridSizes: [row1Length, row2Length, row3Length],
      totalCells
    };

  } catch (error) {
    console.error(error.message);

    // Fallback with same progression pattern
    const progressionPattern = [
      [3, 3, 3], [3, 4, 3], [3, 4, 4], [4, 4, 4], [4, 5, 4], 
      [4, 5, 5], [5, 5, 5], [5, 6, 5], [5, 6, 6], [6, 6, 6],
      [6, 7, 6], [6, 7, 7], [7, 7, 7]
    ];

    const patternIndex = Math.min(level - 1, progressionPattern.length - 1);
    const fallbackLayout = progressionPattern[patternIndex];

    const totalCells = fallbackLayout.reduce((sum, size) => sum + size, 0);

    const fallbackPositions = [
      Array.from({ length: fallbackLayout[0] }, (_, i) => i),
      Array.from({ length: fallbackLayout[1] }, (_, i) => i + fallbackLayout[0]),
      Array.from({ length: fallbackLayout[2] }, (_, i) => i + fallbackLayout[0] + fallbackLayout[1])
    ];

    // Simple fallback word collections
    const wordCollections = {
      3: ["FUN", "TRY", "WIN", "TOP", "NEW", "BIG", "BOX", "CAT", "DOG", "EGG"],
      4: ["GAME", "PLAY", "WORD", "STEP", "MOVE", "TIME", "JUMP", "FAST", "CUBE"],
      5: ["LEVEL", "POWER", "SKILL", "BRAIN", "SMART", "QUICK", "HAPPY", "BLAST"],
      6: ["PUZZLE", "TALENT", "WISDOM", "MASTER", "ACTION", "BOUNCE", "CLEVER"],
      7: ["AMAZING", "SUCCESS", "VICTORY", "TRIUMPH", "BELIEVE", "CAPABLE"]
    };

    const fallbackWords = [];
    for (let i = 0; i < 3; i++) {
      const wordLength = fallbackLayout[i];
      const wordCollection = wordCollections[wordLength];
      const availableWords = wordCollection.filter(word => !usedWordsSet.has(word));
      const word = availableWords.length > 0 
        ? availableWords[Math.floor(Math.random() * availableWords.length)]
        : wordCollection[Math.floor(Math.random() * wordCollection.length)];
      
      usedWordsSet.add(word);

      fallbackWords.push({
        word: word,
        positions: fallbackPositions[i]
      });
    }

    return {
      words: fallbackWords,
      gridSizes: fallbackLayout,
      totalCells
    };
  }
};

export const GamePlayWordFormedPointAwarded = ({ className, ...props }) => {
  const [usedWords, setUsedWords] = useState(new Set());
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [selectedGridPos, setSelectedGridPos] = useState(null); // {row, col}
  // Use Jumbo-Jester grid system
  const [grid, setGrid] = useState(Array(11).fill(""));
  const [letters, setLetters] = useState([]);
  const [gridSizes, setGridSizes] = useState([4, 4, 3]);
  const [totalCells, setTotalCells] = useState(11);
  const [currentLevelWords, setCurrentLevelWords] = useState([]);
  // Hint/Shuffle usage tracking (3 free per 24h)
  const [hints, setHints] = useState(null); // number used today - null until loaded from DB
  const [shuffles, setShuffles] = useState(null); // number used today - null until loaded from DB
  const [lastHintTime, setLastHintTime] = useState(null);
  const [lastShuffleTime, setLastShuffleTime] = useState(null);
  const [hintCountdown, setHintCountdown] = useState("");
  const [shuffleCountdown, setShuffleCountdown] = useState("");
  // Timer
  const [timer, setTimer] = useState(0); // Start at 0, will be set when game starts
  const [timerInterval, setTimerInterval] = useState(null);
  const timerIntervalRef = useRef(null); // Track actual interval ID
  const isSubmittingRef = useRef(false);
  const timerStartedRef = useRef(false);
  
  // Toast state management
  const [toastVisible, setToastVisible] = useState(false);
  const [toastType, setToastType] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [toastMessage2, setToastMessage2] = useState('');
  const [toastMessage3, setToastMessage3] = useState('');
  const [toastCta, setToastCta] = useState('Continue');
  const [showWatchAds, setShowWatchAds] = useState(false);

  // Jumbo-Jester gameplay state (preserving UI)
  const [gameStarted, setGameStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [validatingWords, setValidatingWords] = useState(false);
  const [level, setLevel] = useState(1);
  const [sessionScore, setSessionScore] = useState(0);
  const sessionScoreRef = useRef(0);
  const [expectedWords, setExpectedWords] = useState(['EAT', 'PLAY', 'WORD']); // 3-4-4 default
  const [highestLevel, setHighestLevel] = useState(1);
  const [highestScore, setHighestScore] = useState(0);
  const highestLevelRef = useRef(1);
  const highestScoreRef = useRef(0);
  // Header stats
  const [availableTrials, setAvailableTrials] = useState(null);
  const [freeTrials, setFreeTrials] = useState(null);
  const [purchasedTrials, setPurchasedTrials] = useState(null);
  const [lastTrialTime, setLastTrialTime] = useState(null);
  const [trialCountdown, setTrialCountdown] = useState("");
  const [selectedLetterIndex, setSelectedLetterIndex] = useState(null);
  const [selectedGridIndex, setSelectedGridIndex] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [preFilledPositions, setPreFilledPositions] = useState(new Set());
  // Get user data
  const { user } = useTelegramWebApp();
  const { updateUser } = useUser();
  const tmsPoints = user?.tms_points || 0;
  const gems = user?.gems || 0;

  // Sound control (mute icon)
  const { toggleMute, isMuted, playBackgroundMusic, stopBackgroundMusic } = useSoundManager?.() || {};

  // Helpers
  const formatTime = (seconds) => `${seconds < 10 ? '0' : ''}${seconds}`;
  const formatCountdown = (timeInMs) => {
    if (!timeInMs || timeInMs <= 0) return "00:00:00";
    const totalSeconds = Math.floor(timeInMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2,'0')}:${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}`;
  };

  // Jumbo-Jester letter selection logic
  const selectLetter = (index) => {
    console.log('selectLetter called:', { 
      index, 
      gameStarted, 
      letter: letters[index],
      selectedGridIndex 
    });
    
    if (!gameStarted || !letters[index]) {
      console.log('Cannot select letter - game not started or no letter at index');
      return;
    }
    
    console.log('Letter selected from rack:', letters[index]);
    setSelectedLetterIndex(index);
    
    if (selectedGridIndex !== null) {
      console.log('Grid position already selected, placing letter immediately');
      placeLetter(index, selectedGridIndex);
      setSelectedLetterIndex(null);
      setSelectedGridIndex(null);
    }
  };

  // Jumbo-Jester grid selection logic
  const selectGridPosition = (index) => {
    // Calculate which row this position is in
    const row1End = gridSizes[0];
    const row2End = row1End + gridSizes[1];
    const isLastRow = index >= row2End;
    
    console.log('selectGridPosition called:', { 
      index, 
      gameStarted, 
      isPrefilled: preFilledPositions.has(index),
      gridValue: grid[index],
      selectedLetterIndex,
      selectedGridIndex,
      isLastRow: isLastRow,
      rowInfo: `Position ${index} is in row ${index < row1End ? 1 : index < row2End ? 2 : 3}`
    });
    
    if (isLastRow) {
      console.log('🎯 LAST ROW CLICKED! Position:', index);
    }
    
    if (!gameStarted) {
      console.log('Game not started, ignoring click');
      return;
    }
  
    // Prevent selecting pre-filled positions
    if (preFilledPositions.has(index)) {
      console.log('Position is pre-filled, ignoring click');
      return; // Do nothing if this is a pre-filled position
    }
  
    // If the position contains a letter and no letter is currently selected from grid
    if (grid[index] !== "" && selectedGridIndex === null) {
      console.log('Selecting filled position for moving');
      setSelectedGridIndex(index);
      return;
    }
  
    // If we already have a letter selected from the grid
    if (selectedGridIndex !== null && grid[selectedGridIndex] !== "") {
      // Prevent moving to or from pre-filled positions
      if (preFilledPositions.has(selectedGridIndex) || preFilledPositions.has(index)) {
        console.log('Cannot move pre-filled letter');
        setSelectedGridIndex(null);
        return;
      }
  
      // Swap positions within the grid
      console.log('Swapping or moving letter within grid');
      const newGrid = [...grid];
      const temp = newGrid[selectedGridIndex];
  
      // If target position is empty
      if (grid[index] === "") {
        newGrid[index] = temp;
        newGrid[selectedGridIndex] = "";
      }
      // If target position has a letter, swap them
      else {
        newGrid[selectedGridIndex] = newGrid[index];
        newGrid[index] = temp;
      }
  
      setGrid(newGrid);
      setSelectedGridIndex(null);
      return;
    }
  
    // Handle normal case (empty grid position)
    if (grid[index] === "") {
      console.log('Empty position clicked');
      setSelectedGridIndex(index);
      if (selectedLetterIndex !== null) {
        console.log('Placing letter from rack at position', index);
        placeLetter(selectedLetterIndex, index);
        setSelectedLetterIndex(null);
        setSelectedGridIndex(null);
      }
    }
  };

  // Place a letter on the grid
  const placeLetter = (letterIndex, gridIndex) => {
    // Place letter in grid
    const newGrid = [...grid];
    newGrid[gridIndex] = letters[letterIndex];
    setGrid(newGrid);

    // Remove letter from rack
    const newLetters = [...letters];
    newLetters[letterIndex] = "";
    setLetters(newLetters);
  };

  // Toast functions
  const showToast = (type, message, message2 = '', cta = 'Continue', watchAds = false) => {
    setToastType(type);
    setToastMessage(message);
    setToastMessage2(message2);
    setToastCta(cta);
    setShowWatchAds(watchAds);
    setToastVisible(true);
  };

  const closeToast = () => {
    setToastVisible(false);
  };

  const handleWatchAd = () => {
    // Implement watch ad logic here
    console.log('Watching ad...');
    closeToast();
  };

  // Timer controls
  const startTimer = () => {
    // Always clear any existing interval first using ref
    if (timerIntervalRef.current) {
      console.log('Clearing existing timer before starting new one');
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    
    console.log('Starting new timer from:', timer);
    
    const interval = setInterval(() => {
      setTimer((prev) => {
        // Only log every 5 seconds to reduce console noise
        if (prev % 5 === 0 || prev <= 5) {
          console.log(`⏱️ Timer: ${prev}s`);
        }
        
        // Check if we're submitting
        if (isSubmittingRef.current) {
          console.log('  ⏸️ Timer paused due to submission');
          return prev;
        }
        
        // Check if time is up
        if (prev <= 1) {
          console.log('⏰ ⏰ ⏰ TIMER REACHED 0! ⏰ ⏰ ⏰');
          console.log('  Current state:');
          console.log('    isSubmittingRef.current:', isSubmittingRef.current);
          console.log('    gameStarted:', gameStarted);
          console.log('    currentLevelWords.length:', currentLevelWords.length);
          console.log('    toastVisible:', toastVisible);
          
          // Clear the interval immediately
          if (timerIntervalRef.current) {
            console.log('  🧹 Clearing timer interval');
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
          }
          setTimerInterval(null);
          
          // CRITICAL FIX: Always call handleTimeUp when timer reaches 0
          console.log('  📢 Scheduling handleTimeUp() call...');
          setTimeout(() => {
            // Double check handleTimeUp hasn't already been called
            if (!isSubmittingRef.current) {
              console.log('  ✅ Calling handleTimeUp() now');
              handleTimeUp();
            } else {
              console.log('  ⚠️ handleTimeUp blocked - isSubmittingRef is true (already processing)');
            }
          }, 0);
          
          return 0;
        }
        
        return prev - 1;
      });
    }, 1000);
    
    // Store in both ref and state
    timerIntervalRef.current = interval;
    setTimerInterval(interval);
  };

  const stopTimer = () => {
    console.log('stopTimer called');
    
    // Clear using ref
    if (timerIntervalRef.current) {
      console.log('Clearing timer interval from ref');
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    
    // Always set state to null
    setTimerInterval(null);
  };

  // Backup mechanism: Watch timer state and trigger handleTimeUp if it reaches 0
  useEffect(() => {
    if (gameStarted && timer === 0 && !isSubmittingRef.current && !toastVisible && currentLevelWords.length > 0) {
      console.log('🚨 BACKUP TRIGGER: Timer is 0 but modal not shown - calling handleTimeUp');
      handleTimeUp();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timer, gameStarted, toastVisible, currentLevelWords.length]);

  useEffect(() => {
    // Don't start timer on mount - only start when game begins
    return () => {
      // Cleanup on unmount - clear using ref to ensure it's cleared
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      isSubmittingRef.current = false;
      timerStartedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load trial data from user
  useEffect(() => {
    if (user && user.telegram_id) {
      // Get trial counts from user data
      const freeTr = user.free_trials !== undefined ? Number(user.free_trials) : 0;
      const purchasedTr = user.purchased_trials !== undefined ? Number(user.purchased_trials) : 0;
      
      // Set the states
      setFreeTrials(freeTr);
      setPurchasedTrials(purchasedTr);
      setAvailableTrials(freeTr + purchasedTr);
      setLastTrialTime(user.last_jumbo || null);
      
      // Load highest level and score
      const storedHighestLevel = user.highest_level || 1;
      const storedHighestScore = user.highest_score || 0;
      
      setHighestLevel(storedHighestLevel);
      setHighestScore(storedHighestScore);
      
      // Update refs
      highestLevelRef.current = storedHighestLevel;
      highestScoreRef.current = storedHighestScore;
      
      // Load hint and shuffle counts from database (like Jumbo-Jester)
      const hintCount = user.hint_count !== undefined && user.hint_count !== null ? Number(user.hint_count) : 0;
      const shuffleCount = user.shuffle_count !== undefined && user.shuffle_count !== null ? Number(user.shuffle_count) : 0;
      
      console.log("📊 Loading hints/shuffles from database:", { hintCount, shuffleCount, last_hint: user.last_hint, last_shuffle: user.last_shuffle });
      
      setHints(hintCount);
      setShuffles(shuffleCount);
      
      // Set timestamps for last hint/shuffle
      setLastHintTime(user.last_hint || null);
      setLastShuffleTime(user.last_shuffle || null);
    }
  }, [user]);

  // Trial countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      if (lastTrialTime && freeTrials === 0) {
        const now = new Date();
        const lastTime = new Date(lastTrialTime);
        const timeRemaining = 24 * 60 * 60 * 1000 - (now - lastTime);
        
        if (timeRemaining <= 0) {
          // Reset only the free trials to 3
          const newFreeTrials = 3;
          const totalTrials = newFreeTrials + (purchasedTrials || 0);
          
          setFreeTrials(newFreeTrials);
          setAvailableTrials(totalTrials);
          setLastTrialTime(null);
          setTrialCountdown("");
          
          // Update both fields in the database
          updateUser(user?.telegram_id, { 
            free_trials: newFreeTrials, 
            purchased_trials: purchasedTrials,
            last_jumbo: null 
          });
        } else {
          const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
          const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
          setTrialCountdown(`${hours}h ${minutes}m`);
        }
      } else {
        setTrialCountdown("");
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [lastTrialTime, freeTrials, purchasedTrials, user?.telegram_id, updateUser]);

  // 24h reset logic for hints/shuffles
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      if (hints >= 3 && lastHintTime) {
        const resetAt = new Date(lastHintTime).getTime() + 24 * 60 * 60 * 1000;
        const remaining = resetAt - now;
        if (remaining <= 0) {
          console.log("⏰ useEffect: 24h passed - Resetting hint count to 0");
          setHints(0);
          setLastHintTime(null);
          setHintCountdown("");
          // Update database to reset hint count (like Jumbo-Jester)
          updateUser(user?.telegram_id, { hint_count: 0 });
        } else {
          setHintCountdown(formatCountdown(remaining));
        }
      } else {
        setHintCountdown("");
      }

      if (shuffles >= 3 && lastShuffleTime) {
        const resetAt = new Date(lastShuffleTime).getTime() + 24 * 60 * 60 * 1000;
        const remaining = resetAt - now;
        if (remaining <= 0) {
          console.log("⏰ useEffect: 24h passed - Resetting shuffle count to 0");
          setShuffles(0);
          setLastShuffleTime(null);
          setShuffleCountdown("");
          // Update database to reset shuffle count (like Jumbo-Jester)
          updateUser(user?.telegram_id, { shuffle_count: 0 });
        } else {
          setShuffleCountdown(formatCountdown(remaining));
        }
      } else {
        setShuffleCountdown("");
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [hints, lastHintTime, shuffles, lastShuffleTime, user?.telegram_id, updateUser]);

  // Remove the checkWordFormation that shows modal on letter placement

  const handleHintClick = async () => {
    if (!gameStarted || hints === null) return;
    
    // Check if 24 hours have passed since last hint (like Jumbo-Jester)
    const now = new Date().getTime();
    if (hints >= 3) {
      // If last_hint is set and 24 hours have passed, reset the counter
      if (
        lastHintTime &&
        now - new Date(lastHintTime).getTime() > 24 * 60 * 60 * 1000 // 24 hours
      ) {
        console.log("🔄 24 hours passed - Resetting hint count to 0");
        // Reset hint count to 0 in both state and DB (like Jumbo-Jester)
        await updateUser(user?.telegram_id, { hint_count: 0 });
        setHints(0);
        setLastHintTime(null);
        setHintCountdown(""); // Clear the countdown
        console.log("✅ Hint count reset complete");
      }
    }
    
    // Check if free hints are exhausted (after potential reset)
    if (hints >= 3) {
      // Show purchase prompt
      showToast('buyHint', 'All free hints used', 'Purchase a hint for 5 gems?', 'PURCHASE');
      return;
    }

    // Get current state of grid
    const newGrid = [...grid];
    let hintPlaced = false;

    // Loop through each word in currentLevelWords
    for (let wordIndex = 0; wordIndex < currentLevelWords.length; wordIndex++) {
      const wordObj = currentLevelWords[wordIndex];
      const word = wordObj.word;
      const positions = wordObj.positions;

      // Check each letter position for this word
      for (let letterIndex = 0; letterIndex < word.length; letterIndex++) {
        const position = positions[letterIndex];

        // If this position is empty, place the correct letter there
        if (newGrid[position] === "") {
          const letter = word[letterIndex];
          newGrid[position] = letter;

          // Remove this letter from rack if it's there
          const rackIndex = letters.findIndex((l) => l === letter);
          if (rackIndex >= 0) {
            const newLetters = [...letters];
            newLetters[rackIndex] = "";
            setLetters(newLetters);
          }

          setGrid(newGrid);
          
          const newHintCount = hints + 1;
          setHints(newHintCount);
          
          // Always update the database with new hint count
          const updateData = { hint_count: newHintCount };
          
          // Update last hint time if this is the 3rd hint
          if (newHintCount >= 3) {
            const now = new Date();
            setLastHintTime(now);
            updateData.last_hint = now.toISOString().replace("T", " ").split(".")[0];
          }
          
          // Save to database
          console.log("💾 Saving hint count to database:", updateData);
          await updateUser(user?.telegram_id, updateData);
          console.log("✅ Hint count saved successfully");
          
          hintPlaced = true;
          // No toast needed - hint is placed silently
          break; // Exit the letter loop after placing one hint
        }
      }

      if (hintPlaced) break; // Exit the word loop after placing one hint
    }

    // If no hint could be placed (all positions filled), do nothing
    // No need to show a modal
  };

  const purchaseHint = async () => {
    if (gems < 5) {
      showToast('noGems', 'Not enough gems!', 'Watch ads to get 10 gems', 'WATCH ADS');
      return;
    }

    // Deduct 5 gems
    await updateUser(user?.telegram_id, { gems: gems - 5 });

    // Close the toast
    setToastVisible(false);

    // Now use the hint
    const newGrid = [...grid];
    let hintPlaced = false;

    for (let wordIndex = 0; wordIndex < currentLevelWords.length; wordIndex++) {
      const wordObj = currentLevelWords[wordIndex];
      const word = wordObj.word;
      const positions = wordObj.positions;

      for (let letterIndex = 0; letterIndex < word.length; letterIndex++) {
        const position = positions[letterIndex];

        if (newGrid[position] === "") {
          const letter = word[letterIndex];
          newGrid[position] = letter;

          const rackIndex = letters.findIndex((l) => l === letter);
          if (rackIndex >= 0) {
            const newLetters = [...letters];
            newLetters[rackIndex] = "";
            setLetters(newLetters);
          }

          setGrid(newGrid);
          hintPlaced = true;
          // No toast needed - hint is placed silently
          break;
        }
      }

      if (hintPlaced) break;
    }
  };

  const handleShuffleClick = async () => {
    if (!gameStarted || shuffles === null) return;
    
    // Check if 24 hours have passed since last shuffle (like Jumbo-Jester)
    const now = new Date().getTime();
    if (shuffles >= 3) {
      // If last_shuffle is set and 24 hours have passed, reset the counter
      if (
        lastShuffleTime &&
        now - new Date(lastShuffleTime).getTime() > 24 * 60 * 60 * 1000 // 24 hours
      ) {
        console.log("🔄 24 hours passed - Resetting shuffle count to 0");
        // Reset shuffle count to 0 in both state and DB (like Jumbo-Jester)
        await updateUser(user?.telegram_id, { shuffle_count: 0 });
        setShuffles(0);
        setLastShuffleTime(null);
        setShuffleCountdown(""); // Clear the countdown
        console.log("✅ Shuffle count reset complete");
      }
    }
    
    // Check if free shuffles are exhausted (after potential reset)
    if (shuffles >= 3) {
      // Show purchase prompt
      showToast('buyShuffle', 'All free shuffles used', 'Purchase a shuffle for 3 gems?', 'PURCHASE');
      return;
    }

      const newShuffleCount = shuffles + 1;
      setShuffles(newShuffleCount);
      
      // Always update the database with new shuffle count
      const updateData = { shuffle_count: newShuffleCount };
      
      if (newShuffleCount >= 3) {
        const now = new Date();
        setLastShuffleTime(now);
        updateData.last_shuffle = now.toISOString().replace("T", " ").split(".")[0];
      }
      
      // Save to database
      console.log("💾 Saving shuffle count to database:", updateData);
      await updateUser(user?.telegram_id, updateData);
      console.log("✅ Shuffle count saved successfully");
      
      // Simple shuffle of rack letters
      setLetters((prev) => [...prev].sort(() => 0.5 - Math.random()));
      // No toast needed - shuffle happens silently
  };

  const purchaseShuffle = async () => {
    if (gems < 3) {
      showToast('noGems', 'Not enough gems!', 'Watch ads to get 10 gems', 'WATCH ADS');
      return;
    }

    // Deduct 3 gems
    await updateUser(user?.telegram_id, { gems: gems - 3 });

    // Close the toast
    setToastVisible(false);

    // Now shuffle the letters
    setLetters((prev) => [...prev].sort(() => 0.5 - Math.random()));
    // No toast needed - shuffle happens silently
  };

  const handleTimeUp = async () => {
    console.log("🚀 handleTimeUp() CALLED");
    console.log("  isSubmittingRef.current:", isSubmittingRef.current);
    console.log("  gameStarted:", gameStarted);
    console.log("  currentLevelWords.length:", currentLevelWords.length);
    console.log("  toastVisible:", toastVisible);
    
    // Prevent multiple calls
    if (isSubmittingRef.current) {
      console.log("  ❌ BLOCKED: Already submitting, ignoring time up");
      return;
    }
    
    // Safety check - don't process if game hasn't started or no words loaded
    if (!gameStarted) {
      console.log("  ❌ BLOCKED: Game not started");
      return;
    }
    
    if (currentLevelWords.length === 0) {
      console.log("  ❌ BLOCKED: No words loaded");
      return;
    }
    
    console.log("  ✅ All checks passed - proceeding with time up validation");
    
    console.log("=== TIME UP VALIDATION DEBUG ===");
    console.log("Current grid state:", grid);
    console.log("Grid sizes:", gridSizes);
    console.log("Total cells:", totalCells);
    console.log("Current words to validate:", currentLevelWords);
    console.log("================================");
    
    // Set flags to prevent timer from calling this again
    isSubmittingRef.current = true;
    
    // Stop the timer
    stopTimer();
    setValidatingWords(true);
    
    const currentGrid = [...grid];
    const wordsToValidate = [...currentLevelWords];
    
    let correct = 0;
    let earnedPoints = 0;
    const wordResults = [];
    
    for (let i = 0; i < wordsToValidate.length; i++) {
      const wordObj = wordsToValidate[i];
      const word = wordObj.word;
      const positions = wordObj.positions;
      
      console.log(`\n--- Checking Row ${i + 1} ---`);
      console.log(`Expected word: "${word}"`);
      console.log(`Positions to check:`, positions);
      
      // Extract filled letters from grid
      const filledLetters = positions.map(pos => {
        const letter = currentGrid[pos];
        console.log(`  Position ${pos}: "${letter || 'EMPTY'}"`);
        return letter;
      });
      const gridWord = filledLetters.join("");
      
      console.log(`Filled letters:`, filledLetters);
      console.log(`Formed word: "${gridWord}"`);
      
      // Check if word is completely filled
      const isComplete = !filledLetters.includes("");
      console.log(`Is complete? ${isComplete}`);
      
      // IMPORTANT: Skip validation for incomplete words - they're automatically marked as incorrect
      if (!isComplete) {
        console.log(`❌ Row ${i + 1}: Word "${word}" is INCOMPLETE (filled: "${gridWord}") - Marked as incorrect with 0 points`);
        wordResults.push({
          expected: word,
          filled: gridWord,
          isCorrect: false,
          points: 0,
          length: word.length,
          isComplete: false
        });
        continue; // Skip to next word without validating
      }
      
      console.log(`✓ Row ${i + 1}: Word "${word}" is complete (filled: "${gridWord}") - Validating...`);
      
      // Validate with API - allowing valid words since 60-75% pre-filling reduces random chance
      let isWordValid = false;
      try {
        // First try exact match with expected word (bonus: faster)
        if (gridWord.toUpperCase() === word.toUpperCase()) {
          isWordValid = true;
          console.log(`  ✅ Exact match: "${gridWord}" matches expected "${word}"`);
        } else {
          // Then validate with API to allow alternative valid words
          console.log(`  🔍 Word doesn't match expected, checking API for "${gridWord}"...`);
        isWordValid = await validateWordWithAPI(gridWord.toLowerCase());
          console.log(`  ${isWordValid ? '✅' : '❌'} API validation for "${gridWord}": ${isWordValid ? "Valid English word" : "Invalid word"}`);
        }
      } catch (error) {
        console.error(`  ❌ API validation failed for "${gridWord}":`, error);
        // Fallback validation - exact match with expected word
        isWordValid = gridWord.toUpperCase() === word.toUpperCase();
        console.log(`  Fallback to exact match: ${isWordValid}`);
      }
      
      // Calculate points if word is valid
      let wordPoints = 0;
      if (isWordValid) {
        correct++;
        
        // Calculate points based on word length
        switch (gridWord.length) {
          case 3: wordPoints = 100; break;
          case 4: wordPoints = 150; break;
          case 5: wordPoints = 200; break;
          case 6: wordPoints = 250; break;
          case 7: wordPoints = 300; break;
          default: wordPoints = gridWord.length * 100;
        }
        
        earnedPoints += wordPoints;
        console.log(`  💰 Points earned: ${wordPoints} (Total so far: ${earnedPoints})`);
      } else {
        console.log(`  ❌ No points - word is invalid`);
      }
      
      wordResults.push({
        expected: word,
        filled: gridWord,
        isCorrect: isWordValid,
        points: wordPoints,
        length: gridWord.length,
        isComplete: true
      });
      
      console.log(`--- End Row ${i + 1} ---\n`);
    }
    
    console.log("=== FINAL RESULTS ===");
    console.log(`Correct words: ${correct}/${wordsToValidate.length}`);
    console.log(`Total points earned: ${earnedPoints}`);
    console.log("Word results:", wordResults);
    console.log("====================");
    
    // Calculate completion statistics
    const completedWords = wordResults.filter(result => result.isComplete).length;
    const totalWords = wordsToValidate.length;
    
    // Update session score
    const newSessionScore = sessionScoreRef.current + earnedPoints;
    sessionScoreRef.current = newSessionScore;
    setSessionScore(newSessionScore);
    
    console.log(`Current session score: ${newSessionScore}`);
    
    // Compare with highest score
    if (newSessionScore > parseFloat(highestScoreRef.current)) {
      console.log(`New highest score: ${newSessionScore} (old: ${highestScoreRef.current})`);
      highestScoreRef.current = newSessionScore;
      setHighestScore(newSessionScore);
      
      // Save to database
      try {
        await updateUser(user?.telegram_id, { highest_score: newSessionScore });
        console.log("Updated highest score in database:", newSessionScore);
      } catch (error) {
        console.error("Failed to update highest score:", error);
      }
    }
    
    // Update Q points
    const TotalPoints = parseFloat(tmsPoints) + parseFloat(earnedPoints);
    const newTotalPoints = TotalPoints.toFixed(2);
    
    try {
      await updateUser(user?.telegram_id, { tms_points: newTotalPoints });
      console.log("Database updated successfully with new tms_points:", newTotalPoints);
    } catch (error) {
      console.error("Error updating database:", error);
    }
    
    setValidatingWords(false);
    
    // Show appropriate toast based on performance
    // STRICT: ALL words must be completed AND correct to advance
    const allWordsCorrect = correct === totalWords && completedWords === totalWords && totalWords > 0 && correct > 0;
    
    console.log("=== LEVEL COMPLETION CHECK ===");
    console.log(`All words correct? ${allWordsCorrect}`);
    console.log(`Correct: ${correct}, Completed: ${completedWords}, Total: ${totalWords}`);
    console.log(`Condition breakdown:`);
    console.log(`  - correct === totalWords? ${correct === totalWords} (${correct} === ${totalWords})`);
    console.log(`  - completedWords === totalWords? ${completedWords === totalWords} (${completedWords} === ${totalWords})`);
    console.log(`  - totalWords > 0? ${totalWords > 0}`);
    console.log(`  - correct > 0? ${correct > 0}`);
    console.log("==============================");
    
    if (allWordsCorrect) {
      console.log("✅ Level complete - showing SUCCESS modal (ALLOWS advancement to next level)");
      setToastType("success");
      setToastMessage(`Perfect! Level ${level} complete!`);
      setToastMessage2(`+${earnedPoints} Q points (${newTotalPoints} total)`);
      setToastMessage3(`Highest Level: ${highestLevelRef.current} | Session Score: ${newSessionScore} | Best Score: ${highestScoreRef.current}`);
      setShowWatchAds(false); // Ensure watch ads button is not shown
      setToastCta('Continue'); // Set correct CTA
    } else {
      console.log("⚠️ Level NOT complete - showing CONTINUE OPTIONS modal (BLOCKS advancement)");
      console.log(`  Player can only: (1) Watch ads for 30 more seconds, (2) Pay gems for 30 more seconds, or (3) Restart game`);
      console.log(`  Player CANNOT advance to next level unless they complete all ${totalWords} words correctly`);
      
      // Show continue options - player did NOT complete level
      setToastType("continueOptions");
      setToastMessage("Time's up! Choose to continue:");
      setToastMessage2(`Score: ${correct}/${totalWords} completed words correct`);
      setToastMessage3(`Highest Level: ${highestLevelRef.current} | Session Score: ${newSessionScore} | Best Score: ${highestScoreRef.current}`);
      setShowWatchAds(false); // Ensure watch ads button is not shown
      // Reset ad count for this level attempt
      localStorage.setItem('adCount', '0');
    }
    
    setToastVisible(true);
    isSubmittingRef.current = false; // Reset flag after validation
  };

const handleGameOver = () => {
  stopTimer();
  // Reset used words on game over
  setUsedWords(new Set());
  const remaining = Math.max(availableTrials || 0, 0);
  const remainingText = remaining === 1
    ? 'you still have 1 more game to play for the day!'
    : `you still have ${remaining} more games to play for the day!`;
  showToast('gameOver', 'OOPS! TRY AGAIN.', remainingText, 'PLAY AGAIN');
};

  const restartGame = async () => {
    console.log("🔄 Restart Game - Resetting to Level 1");
    
    // Reset ad count when restarting game
    localStorage.setItem('adCount', '0');
    console.log("  Ad count reset to 0");
    
    // Reset session score when restarting
    sessionScoreRef.current = 0;
    setSessionScore(0);
    console.log("  Session score reset to 0");
    
    // Try to use a trial
    const success = await useOneTrial();
    if (!success) {
      console.log("  ❌ No trials available - cannot restart");
      return; // Don't restart game if no trials available
    }
    
    console.log("  ✅ Trial used - proceeding with restart");
    
    // Close the toast first
    setToastVisible(false);
    
    // Reset to initial state
    setLevel(1);
    console.log("  Level reset to 1");
    
    const defaultLayout = [3, 3, 3]; // Reset to level 1 layout
    const defaultTotalCells = defaultLayout.reduce((sum, size) => sum + size, 0);
    
    setGridSizes(defaultLayout);
    setTotalCells(defaultTotalCells);
    setGrid(Array(defaultTotalCells).fill(""));
    setLetters([]);
    setSelectedLetterIndex(null);
    setSelectedGridIndex(null);
    setGameStarted(false); // Temporarily set to false
    setIsLoading(false);
    setValidatingWords(false);
    setIsSubmitting(false);
    isSubmittingRef.current = false; // Reset submitting ref
    
    // Reset used words when restarting
    setUsedWords(new Set());
    // Reset pre-filled positions
    setPreFilledPositions(new Set());
    
    // Clear timer using both ref and state
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setTimerInterval(null);
    setTimer(0);
    
    // Restart the game with a slight delay to ensure state updates
    setTimeout(() => {
      setGameStarted(true);
      console.log("  Game restarted at Level 1");
      // setupGame will fetch words and configure everything for level 1
      setupGame(1);
    }, 200);
  }

  const watchAdToContinue = () => {
    console.log("📺 Watch Ads to Continue - Giving 15 more seconds on SAME level (Level does NOT advance)");
    
    setToastVisible(false);

    setToastType("adLoading");
    setToastMessage("Loading advertisement...");
    setToastVisible(true);

    // Initialize ad count if not already initialized
    if (!localStorage.getItem('adCount')) {
      localStorage.setItem('adCount', '0');
    }

    const currentAdCount = parseInt(localStorage.getItem('adCount'), 10);
    
    console.log(`📊 Current ad count: ${currentAdCount}/3`);

    window.Adsgram?.init({ blockId: "int-13890" })?.show()
      .then((result) => {
        setToastVisible(false);
        if (result.done) {
          console.log(`✅ Ad ${currentAdCount + 1} completed`);
          
          // Increment ad count
          localStorage.setItem('adCount', String(currentAdCount + 1));

          if (currentAdCount + 1 >= 3) {
            // Reset ad count after 3 ads
            localStorage.setItem('adCount', '0');
            
            console.log("✅ Watched 3 ads - Adding 15 seconds to SAME level (no level advancement)");
            
            // Clear any existing timer using ref
            if (timerIntervalRef.current) {
              clearInterval(timerIntervalRef.current);
              timerIntervalRef.current = null;
            }
            
            setTimer(15); // Reset timer - reduced to match faster gameplay
            isSubmittingRef.current = false; // Reset submitting flag
            
            // Start timer after state update
            setTimeout(() => startTimer(), 100);
          } else {
            setToastType("info");
            setToastMessage(`Watch ${3 - (currentAdCount + 1)} more ads to continue`);
            setToastVisible(true);
          }
        } else {
          setToastType("error");
          setToastMessage("Ad not completed");
          setToastVisible(true);
        }
      })
      .catch((error) => {
        console.error("Ad error:", error);
        setToastVisible(false);
        setToastType("error");
        setToastMessage("Failed to load ad");
        setToastVisible(true);
      });
  };

  const deductPointsToContinue = async () => {
    console.log("💎 Use 10 Gems to Continue - Giving 15 more seconds on SAME level (Level does NOT advance)");
    
    if (gems < 10) {
      setToastType("noGems");
      setToastMessage("Not enough gems!");
      setToastMessage2("Watch ads to get 10 gems");
      setToastVisible(true);
      return;
    }

    // Deduct 10 gems
    const newGems = gems - 10;

    await updateUser(user?.telegram_id, { gems: newGems });

    setToastVisible(false);
    
    console.log("✅ Used 10 gems - Adding 15 seconds to SAME level (no level advancement)");
    
    // Clear any existing timer using ref
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    
    setTimer(15); // Reset timer - reduced to match faster gameplay
    isSubmittingRef.current = false; // Reset submitting flag
    
    // Start timer after state update
    setTimeout(() => startTimer(), 100);
  };

  const watchAdForGems = () => {
    // Hide any existing toast
    setToastVisible(false);
    
    // Show ad loading message
    setToastType("adLoading");
    setToastMessage("Loading advertisement...");
    setToastMessage2("Please wait");
    setToastVisible(true);
    
    // Initialize and show Adsgram ad
    window.Adsgram?.init({ blockId: "int-13890" })?.show()
      .then((result) => {
        // Hide the loading toast
        setToastVisible(false);
        
        if (result.done) {
          // Ad was watched successfully
          // Add 10 gems to user account
          updateUser(user?.telegram_id, { gems: gems + 10 })
            .then(() => {
              // Show success message
              setToastType("gemsEarned");
              setToastMessage("You earned 10 gems!");
              setToastMessage2("");
              setToastVisible(true);
              
              // Auto-close success message
              setTimeout(() => {
                setToastVisible(false);
              }, 1500);
            })
            .catch(error => {
              console.error("Error updating user gems:", error);
              setToastType("error");
              setToastMessage("Failed to add gems");
              setToastMessage2("Please try again");
              setToastVisible(true);
            });
        } else {
          // Ad wasn't completed
          setToastType("error");
          setToastMessage("Ad not completed");
          setToastMessage2("No gems awarded");
          setToastVisible(true);
        }
      })
      .catch(() => {
        setToastVisible(false);
        setToastType("error");
        setToastMessage("Error playing ad");
        setToastMessage2("Please try again later");
        setToastVisible(true);
        
        // Auto-close error message
        setTimeout(() => {
          setToastVisible(false);
        }, 3000);
      });
  };

  // Validate a word with Datamuse (exact match)
  const validateWordWithAPI = async (word) => {
    try {
      const response = await fetch(`https://api.datamuse.com/words?sp=${word.toLowerCase()}&max=1`);
      if (!response.ok) return false;
      const data = await response.json();
      if (data.length === 0) return false;
      return data[0].word.toLowerCase() === word.toLowerCase();
    } catch (e) {
      console.error('Word validation failed:', e);
      return false;
    }
  };

  // Fetch three words of lengths 3,4,4 similar to Jumbo-Jester
  const fetchThreeWords = async () => {
    try {
      const lengths = [3, 4, 4];
      const responses = await Promise.all(
        lengths.map((len) => fetch(`https://api.datamuse.com/words?ml=game&sp=${'?'.repeat(len)}&max=30`))
      );
      if (!responses.every((r) => r.ok)) throw new Error('Fetch failed');
      const data = await Promise.all(responses.map((r) => r.json()));
      const picks = data.map((arr, idx) => {
        const len = lengths[idx];
        const candidates = arr
          .map((i) => (i.word || '').toUpperCase())
          .filter((w) => w.length === len && /^[A-Z]+$/.test(w));
        if (candidates.length === 0) throw new Error('No candidates');
        return candidates[Math.floor(Math.random() * candidates.length)];
      });
      return picks; // ['ABC','ABCD','EFGH']
    } catch (e) {
      console.warn('Falling back words:', e?.message);
      const fallback = {
        3: ['FUN', 'TRY', 'WIN', 'TOP', 'NEW', 'BIG'],
        4: ['GAME', 'PLAY', 'WORD', 'STEP', 'MOVE', 'TIME'],
      };
      const pick = (len) => fallback[len][Math.floor(Math.random() * fallback[len].length)];
      return [pick(3), pick(4), pick(4)];
    }
  };

  // Use Jumbo-Jester setupGame logic
  const setupGame = async (levelToUse = null) => {
    try {
      // Use provided level or fall back to state level
      const currentLevel = levelToUse !== null ? levelToUse : level;
      
      // Stop any existing timer first using ref for certainty
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      stopTimer();
      isSubmittingRef.current = false;
      timerStartedRef.current = false;
      
      const wordData = await fetchRandomThreeLetterWords(currentLevel, usedWords);
      setGridSizes(wordData.gridSizes);
      setTotalCells(wordData.totalCells);
      setGrid(Array(wordData.totalCells).fill(""));
      setLetters([]);
      setCurrentLevelWords(wordData.words);
      
      // Update used words state
      setUsedWords(new Set([...usedWords, ...wordData.words.map(w => w.word)]));
      
      // Setup grid with pre-filled letters
      const newGrid = Array(wordData.totalCells).fill("");
      const positionToLetterMap = new Map();
      const preFilledPositions = new Set(); // Track pre-filled positions
      
      wordData.words.forEach(wordObj => {
        const word = wordObj.word;
        const positions = wordObj.positions;
        
        positions.forEach((pos, idx) => {
          if (pos >= 0 && pos < wordData.totalCells) {
            positionToLetterMap.set(pos, word[idx]);
          }
        });
      });
      
      // Pre-fill letters strategically - ensuring each row has guidance
      // Strategy: Fill 60-70% of each word's letters to guide users to the expected word
      
      // Process each word/row individually to ensure balanced pre-filling
      wordData.words.forEach((wordObj, rowIndex) => {
        const word = wordObj.word;
        const positions = wordObj.positions;
        const wordLength = word.length;
        
        // Calculate how many letters to pre-fill for this word
        // Use 65-75% range, randomized per word
        const preFilledPercentage = 0.65 + Math.random() * 0.1; // 65-75%
        const numToPreFill = Math.max(
          Math.floor(wordLength * preFilledPercentage),
          Math.ceil(wordLength * 0.6) // Minimum 60%
        );
        
        // Create array of indices for this word
        const wordIndices = Array.from({ length: wordLength }, (_, i) => i);
        
        // Strategically select positions to pre-fill
        // Prioritize: first letter (40% chance), last letter (40% chance), middle letters (always)
        const positionsToPreFill = [];
        
        // Always include some middle letters for guidance
        const middleStart = Math.floor(wordLength * 0.3);
        const middleEnd = Math.ceil(wordLength * 0.7);
        
        // Shuffle word indices
        const shuffledIndices = [...wordIndices].sort(() => 0.5 - Math.random());
        
        // Select positions ensuring good distribution
        for (let i = 0; i < shuffledIndices.length && positionsToPreFill.length < numToPreFill; i++) {
          const idx = shuffledIndices[i];
          
          // Prioritize middle positions, but include edges sometimes
          const isMiddle = idx >= middleStart && idx < middleEnd;
          const isEdge = idx === 0 || idx === wordLength - 1;
          
          if (isMiddle) {
            positionsToPreFill.push(idx);
          } else if (isEdge && Math.random() < 0.5) {
            positionsToPreFill.push(idx);
          } else if (positionsToPreFill.length < numToPreFill) {
            positionsToPreFill.push(idx);
          }
        }
        
        // Ensure we have enough pre-filled positions
        while (positionsToPreFill.length < numToPreFill && positionsToPreFill.length < wordLength) {
          const remainingIndices = wordIndices.filter(idx => !positionsToPreFill.includes(idx));
          if (remainingIndices.length > 0) {
            const randomIdx = remainingIndices[Math.floor(Math.random() * remainingIndices.length)];
            positionsToPreFill.push(randomIdx);
          } else {
            break;
          }
        }
        
        // Fill the selected positions in the grid
        positionsToPreFill.forEach(idx => {
          const gridPosition = positions[idx];
          if (gridPosition >= 0 && gridPosition < wordData.totalCells) {
            newGrid[gridPosition] = word[idx];
            preFilledPositions.add(gridPosition);
          }
        });
        
        console.log(`Row ${rowIndex + 1}: Word "${word}" - Pre-filled ${positionsToPreFill.length}/${wordLength} letters (${Math.round(positionsToPreFill.length/wordLength*100)}%)`);
      });
      
      setGrid(newGrid);
      setPreFilledPositions(preFilledPositions); // Store pre-filled positions
      
      // Build letter rack
      const emptyPositions = newGrid.map((cell, idx) => cell === "" ? idx : -1).filter(idx => idx !== -1);
      const letterNeeds = new Map();
      
      emptyPositions.forEach(pos => {
        const letter = positionToLetterMap.get(pos);
        if (letter) {
          letterNeeds.set(letter, (letterNeeds.get(letter) || 0) + 1);
        }
      });
      
      const requiredLetters = [];
      letterNeeds.forEach((count, letter) => {
        for (let i = 0; i < count; i++) {
          requiredLetters.push(letter);
        }
      });
      
      const distractionCount = Math.ceil(requiredLetters.length * 0.3);
      const distractions = Array.from({ length: distractionCount }, () =>
        requiredLetters[Math.floor(Math.random() * requiredLetters.length)]
      );
      
      const allRackLetters = [...requiredLetters, ...distractions].sort(() => 0.5 - Math.random());
      setLetters(allRackLetters);
      
      // Set timer - significantly reduced since 60-75% is already pre-filled
      const emptyPercentage = emptyPositions.length / wordData.totalCells;
      const minTime = 8; // Minimum time when very few cells empty
      const maxTime = 25; // Maximum time when many cells empty
      const baseTime = minTime + Math.floor(emptyPercentage * (maxTime - minTime));
      
      console.log(`⏱️ Timer calculation: ${emptyPositions.length}/${wordData.totalCells} empty (${Math.round(emptyPercentage * 100)}%) → ${baseTime} seconds`);
      console.log(`  60-75% pre-filled = faster gameplay with ${minTime}-${maxTime}s range`);
      
      // Stop any existing timer first
      stopTimer();
      
      // Set timer value
      setTimer(baseTime);
      console.log(`  Timer set to ${baseTime} seconds`);
      
      // Reset submitting flag to ensure timer can complete
      isSubmittingRef.current = false;
      
      // Start timer after a short delay to ensure state is updated
      setTimeout(() => {
        if (baseTime > 0) {
          console.log(`  Starting timer countdown from ${baseTime} seconds...`);
          startTimer();
        } else {
          console.log(`  ⚠️ Timer is 0 or less, not starting`);
        }
      }, 100);
    } catch (error) {
      console.error("Error setting up game:", error);
    }
  };

  // Remove getRows function as we're using Jumbo-Jester grid system

  // Use a trial when starting a game
  const useOneTrial = async () => {
    if (availableTrials <= 0) {
      // Show purchase prompt
      setToastType("buyTrial");
      setToastMessage("No trials remaining");
      setToastMessage2(`Purchase a trial for 10 gems?${trialCountdown ? ` Free trials reset in ${trialCountdown}` : ''}`);
      setToastVisible(true);
      return false; // Return false to indicate failure
    }
    
    // First use purchased trials, then free trials
    if (purchasedTrials > 0) {
      const newPurchasedTrials = purchasedTrials - 1;
      setPurchasedTrials(newPurchasedTrials);
      setAvailableTrials(freeTrials + newPurchasedTrials);
      
      // Update both fields in the database
      await updateUser(user?.telegram_id, { 
        purchased_trials: newPurchasedTrials,
        free_trials: freeTrials
      });
    } else {
      // Use a free trial
      const newFreeTrials = freeTrials - 1;
      
      setFreeTrials(newFreeTrials);
      setAvailableTrials(newFreeTrials + purchasedTrials);
      
      // If this was the last free trial, set the timer
      if (newFreeTrials === 0) {
        const currentTime = new Date().toISOString();
        setLastTrialTime(currentTime);
        
        await updateUser(user?.telegram_id, { 
          free_trials: newFreeTrials,
          purchased_trials: purchasedTrials,
          last_jumbo: currentTime
        });
      } else {
        await updateUser(user?.telegram_id, { 
          free_trials: newFreeTrials,
          purchased_trials: purchasedTrials
        });
      }
    }
    
    return true; // Return true to indicate success
  };

  const initializeGame = async () => {
    if (availableTrials <= 0) {
      setToastType('buyTrial');
      setToastMessage('No trials remaining');
      setToastMessage2('Watch an ad or try again later');
      setToastVisible(true);
      return;
    }
    
    // Try to use a trial
    const success = await useOneTrial();
    if (!success) {
      return; // Don't start game if no trials available
    }
    
    // Reset ad count when starting a new game
    localStorage.setItem('adCount', '0');
    console.log("🎮 Starting new game - Ad count reset to 0");
    
    // Clear any existing timer before starting new game
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    stopTimer();
    isSubmittingRef.current = false;
    timerStartedRef.current = false;
    
    setIsLoading(true);
    setGameStarted(true);
    setupGame();
    setIsLoading(false);
    // Timer will be started in setupGame function
  };

  const checkAnswers = async () => {
    // Safety check - don't process if already submitting
    if (isSubmittingRef.current) {
      console.log("Already submitting, ignoring duplicate call");
      return;
    }
    
    // Prevent if modal is already visible
    if (toastVisible) {
      console.log("Modal already visible, ignoring check answers");
      return;
    }
    
    // Safety check - don't process if game hasn't started or no words loaded
    if (!gameStarted || currentLevelWords.length === 0) {
      console.log("Game not properly started, cannot check answers");
      return;
    }
    
    setIsSubmitting(true);
    isSubmittingRef.current = true; // Set ref to prevent timer from triggering
    setValidatingWords(true);
    
    // Stop timer only when submitting answers
    stopTimer();

    try {
      console.log("=== SUBMIT VALIDATION DEBUG ===");
      console.log("Current grid state:", grid);
      console.log("Grid sizes:", gridSizes);
      console.log("Total cells:", totalCells);
      console.log("Current words to validate:", currentLevelWords);
      console.log("================================");
      
      let correct = 0;
      let earnedPoints = 0;
      const wordResults = [];
      
      // Process each word position in the grid
      for (let i = 0; i < currentLevelWords.length; i++) {
        const wordObj = currentLevelWords[i];
        const word = wordObj.word;
        const positions = wordObj.positions;
        
        console.log(`\n--- Checking Row ${i + 1} ---`);
        console.log(`Expected word: "${word}"`);
        console.log(`Positions to check:`, positions);
        
        // Extract the filled letters from the grid using the positions
        const filledLetters = positions.map(pos => {
          const letter = grid[pos];
          console.log(`  Position ${pos}: "${letter || 'EMPTY'}"`);
          return letter;
        });
        
        // Check if this word is completely filled (no empty cells)
        const isComplete = !filledLetters.includes("");
        
        // Create the grid word by joining the letters
        const gridWord = filledLetters.join("");
        
        console.log(`Filled letters:`, filledLetters);
        console.log(`Formed word: "${gridWord}"`);
        console.log(`Is complete? ${isComplete}`);
        
        // IMPORTANT: Skip validation for incomplete words - they're automatically marked as incorrect
        if (!isComplete) {
          console.log(`❌ Row ${i + 1}: Word "${word}" is INCOMPLETE (filled: "${gridWord}") - Marked as incorrect with 0 points`);
          wordResults.push({
            expected: word,
            filled: gridWord,
            isCorrect: false,
            points: 0,
            length: word.length,
            isComplete: false
          });
          continue; // Skip to next word without validating
        }
        
        console.log(`✓ Row ${i + 1}: Word "${word}" is complete (filled: "${gridWord}") - Validating...`);
        
        // Validate with API - allowing valid words since 60-75% pre-filling reduces random chance
        let isWordValid = false;
        try {
          // First try exact match with expected word (bonus: faster)
          if (gridWord.toUpperCase() === word.toUpperCase()) {
            isWordValid = true;
            console.log(`  ✅ Exact match: "${gridWord}" matches expected "${word}"`);
          } else {
            // Then validate with API to allow alternative valid words
            console.log(`  🔍 Word doesn't match expected, checking API for "${gridWord}"...`);
            isWordValid = await validateWordWithAPI(gridWord.toLowerCase());
            console.log(`  ${isWordValid ? '✅' : '❌'} API validation for "${gridWord}": ${isWordValid ? "Valid English word" : "Invalid word"}`);
          }
        } catch (error) {
          console.error(`  ❌ API validation failed for "${gridWord}":`, error);
          // Final fallback - exact match with expected word
          isWordValid = gridWord.toUpperCase() === word.toUpperCase();
          console.log(`  Fallback to exact match: ${isWordValid}`);
        }
        
        // Calculate points if the word is valid
        let wordPoints = 0;
        if (isWordValid) {
          correct++;
          
          // Calculate points based on word length
          switch (gridWord.length) {
            case 3: wordPoints = 100; break;
            case 4: wordPoints = 150; break;
            case 5: wordPoints = 200; break;
            case 6: wordPoints = 250; break;
            case 7: wordPoints = 300; break;
            default: wordPoints = gridWord.length * 100;
          }
          
          earnedPoints += wordPoints;
          console.log(`  💰 Points earned: ${wordPoints} (Total so far: ${earnedPoints})`);
        } else {
          console.log(`  ❌ No points - word is invalid`);
        }
        
        wordResults.push({
          expected: word,
          filled: gridWord,
          isCorrect: isWordValid,
          points: wordPoints,
          length: gridWord.length,
          isComplete: true
        });
        
        console.log(`--- End Row ${i + 1} ---\n`);
      }
      
      console.log("=== FINAL SUBMIT RESULTS ===");
      console.log(`Correct words: ${correct}/${currentLevelWords.length}`);
      console.log(`Total points earned: ${earnedPoints}`);
      console.log("Word results:", wordResults);
      console.log("============================");
      
      // Calculate statistics for reporting
      const completedWords = wordResults.filter(result => result.isComplete).length;
      const totalWords = currentLevelWords.length;
      
      // Update session score
      const newSessionScore = sessionScoreRef.current + earnedPoints;
      sessionScoreRef.current = newSessionScore;
      setSessionScore(newSessionScore);
      
      console.log(`Current session score: ${newSessionScore}`);
      
      // Compare session score with highest score
      if (newSessionScore > parseFloat(highestScoreRef.current)) {
        console.log(`New highest score: ${newSessionScore} (old: ${highestScoreRef.current})`);
        highestScoreRef.current = newSessionScore;
        setHighestScore(newSessionScore);
        
        // Save the new highest score to database
        try {
          await updateUser(user?.telegram_id, { highest_score: newSessionScore });
          console.log("Updated highest score in database:", newSessionScore);
        } catch (error) {
          console.error("Failed to update highest score:", error);
        }
      }
      
      // Update total Q points
      const TotalPoints = parseFloat(tmsPoints) + parseFloat(earnedPoints);
      const newTotalPoints = TotalPoints.toFixed(2);
      
      console.log(`Updating Q points: ${tmsPoints} + ${earnedPoints} = ${newTotalPoints}`);
      
      // Update Q points in the database
      try {
        await updateUser(user?.telegram_id, { tms_points: newTotalPoints });
        console.log("Database updated successfully with new tms_points:", newTotalPoints);
      } catch (error) {
        console.error("Failed to update user points:", error);
      }
      
      // Show appropriate toast based on performance
      // STRICT: ALL words must be completed AND correct to advance
      const allWordsCorrect = correct === totalWords && completedWords === totalWords && totalWords > 0 && correct > 0;
      
      console.log("=== LEVEL COMPLETION CHECK (SUBMIT) ===");
      console.log(`All words correct? ${allWordsCorrect}`);
      console.log(`Correct: ${correct}, Completed: ${completedWords}, Total: ${totalWords}`);
      console.log(`Condition breakdown:`);
      console.log(`  - correct === totalWords? ${correct === totalWords} (${correct} === ${totalWords})`);
      console.log(`  - completedWords === totalWords? ${completedWords === totalWords} (${completedWords} === ${totalWords})`);
      console.log(`  - totalWords > 0? ${totalWords > 0}`);
      console.log(`  - correct > 0? ${correct > 0}`);
      console.log('Word validation results:', wordResults);
      console.log("=======================================");
      
      if (allWordsCorrect) {
        console.log("✅ Level complete - showing SUCCESS modal (ALLOWS advancement to next level)");
        setToastType("success");
        setToastMessage(`Perfect! Level ${level} complete!`);
        setToastMessage2(`+${earnedPoints} Q points (${newTotalPoints} total)`);
        setToastMessage3(`Highest Level: ${highestLevelRef.current} | Session Score: ${newSessionScore} | Best Score: ${highestScoreRef.current}`);
        setShowWatchAds(false); // Ensure watch ads button is not shown
        setToastCta('Continue'); // Set correct CTA
      } else {
        console.log("⚠️ Level NOT complete - showing CONTINUE OPTIONS modal (BLOCKS advancement)");
        console.log(`  Player can only: (1) Watch ads for 30 more seconds, (2) Pay gems for 30 more seconds, or (3) Restart game`);
        console.log(`  Player CANNOT advance to next level unless they complete all ${totalWords} words correctly`);
        
        // Show continue options for incomplete levels - DO NOT ADVANCE
        setToastType("continueOptions");
        setToastMessage("You didn't complete the level. Choose to continue:");
        setToastMessage2(`Score: ${correct}/${totalWords} completed words correct`);
        setToastMessage3(`Highest Level: ${highestLevelRef.current} | Session Score: ${newSessionScore} | Best Score: ${highestScoreRef.current}`);
        setShowWatchAds(false); // Ensure watch ads button is not shown
        // Reset ad count for this level attempt
        localStorage.setItem('adCount', '0');
      }
      
      setToastVisible(true);
    } catch (e) {
      console.error(e);
    } finally {
      setValidatingWords(false);
      setIsSubmitting(false);
      isSubmittingRef.current = false; // Reset ref
    }
  };

  const nextLevel = () => {
    console.log("🎯 nextLevel() called - Advancing to next level!");
    console.log("✅ User completed level successfully - advancing to next level");
    
    // Reset ad count when advancing to next level
    localStorage.setItem('adCount', '0');
    console.log("  Ad count reset to 0 for next level");
    
    // IMPORTANT: Set submitting flag and reset timer BEFORE closing modal
    // This prevents the backup useEffect from triggering handleTimeUp again
    isSubmittingRef.current = true;
    setTimer(-1); // Set to -1 to prevent backup trigger
    
    // Stop timer and clear interval
    stopTimer();
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    
    // Close modal
    setToastVisible(false);
    
    // Wait for modal to close, then proceed with level advancement
    setTimeout(() => {
      timerStartedRef.current = false;
      
      // Increment level
      const newLevel = level + 1;
      setLevel(newLevel);
      
      // Update highest level if needed
      if (newLevel > highestLevelRef.current) {
        highestLevelRef.current = newLevel;
        setHighestLevel(newLevel);
        
        // Save the new highest level to database
        try {
          updateUser(user?.telegram_id, { highest_level: newLevel });
          console.log("Updated highest level in database:", newLevel);
        } catch (error) {
          console.error("Failed to update highest level:", error);
        }
      }
      
      setIsLoading(true);
      
      // Clear selections
      setSelectedLetterIndex(null);
      setSelectedGridIndex(null);
      
      // Setup next level with updated state
      setTimeout(() => {
        setupGame(newLevel);
        setIsLoading(false);
        isSubmittingRef.current = false; // Reset flag after level setup
      }, 100);
    }, 50);
  };

  // Test functions for different modals
  const testWordFormed = () => {
    showToast('wordFormed', 'WELL DONE! YOU GOT IT!', 'you still have 2 more games to play for the day!', 'PLAY AGAIN');
  };

  const testTimeUp = () => {
    showToast('timeUp', 'OOPS! TRY AGAIN.', 'you still have 2 more games to play for the day!', 'PLAY AGAIN');
  };

  const testWatchAds = () => {
    showToast('noHints', 'WATCH ADS', 'Watcha video ad to get 1 hint and 2 shuffles.', 'WATCH', true);
  };

  const testHintUsed = () => {
    showToast('hintUsed', 'Hint used!', 'Use hints wisely to solve puzzles', 'Continue');
  };

  return (
    <div className={"game-play-word-formed-point-awarded " + className}>
      {/* Topmost White Container */}
      <div className="topmost-white-container">
        {/* Close Button Section */}
        <div className="close-button-section">
          <button className="close-button">
            <img src="/assets/x-black.png" alt="Close" width={20} height={20} />
          </button>
        </div>
        
        {/* Header */}
        <div className="header">
          <div className="user-profile">
            <div className="shrink-0 w-8 h-[32.34px] relative">
              <img
                className="w-8 h-[32.34px] absolute left-0 top-0 overflow-visible"
                src="/assets/na.png"
                alt="Icon"
              />
                  <div
                    className="text-center text-[17.2px] font-normal uppercase absolute left-[8.6px] top-[2.88px] w-[13.07px] h-[17.19px] text-black"
                    style={{ 
                      transformOrigin: "0 0", 
                      transform: "rotate(0deg) scale(1, 1)",
                      textShadow: "none",
                      WebkitTextStroke: "none"
                    }}
                  >
                    {(user?.user_name || user?.first_name)?.charAt(0) || 'U'}
              </div>
            </div>
            <span className="text-[10px] font-medium">{user?.user_name || user?.first_name || 'USER'}</span>
          </div>
          <div className="currency-display">
            <div className="currency-item" title="Q_points">
              <div className="coin-icon">
                <img src="/assets/token.png" alt="Q_points" width={20} height={20} />
              </div>
              <span className="text-[#ffffff] text-left font-normal">{tmsPoints}</span>
            </div>
            <div className="currency-item" title="Gems">
              <div className="diamond-icon">
                <img src="/assets/diamond.png" alt="Gems" width={20} height={20} />
              </div>
              <span className="text-[#ffffff] text-left font-normal">{gems}</span>
            </div>
            <div className="currency-item" title="Level">
              <div className="coin-icon">
                <img src="/assets/cup.png" alt="Level" width={18} height={18} />
              </div>
              <span className="text-[#ffffff] text-left font-normal">{level}</span>
            </div>
            <div className="currency-item" title="Trials">
              <div className="coin-icon">
                <RotateCcw size={18} color="#ffffff" />
              </div>
              <span className="text-[#ffffff] text-left font-normal">
                {availableTrials !== null ? availableTrials : '--'}
                {trialCountdown && ` (${trialCountdown})`}
              </span>
            </div>
            <button
              onClick={() => {
                if (toggleMute) {
                  toggleMute();
                  if (isMuted) {
                    playBackgroundMusic && playBackgroundMusic();
                  } else {
                    stopBackgroundMusic && stopBackgroundMusic();
                  }
                }
              }}
              className="currency-item"
              title={isMuted ? 'Unmute' : 'Mute'}
              style={{ background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              {isMuted ? (
                <VolumeX size={18} color="#ffffff" />
              ) : (
                <Volume2 size={18} color="#ffffff" />
              )}
            </button>
          </div>
        </div>

        {/* Game Board */}
        <div className="game-board">
        <div className="board-content">
          <div className="corner-circle-bottom-left"></div>
          <div className="corner-circle-bottom-right"></div>
          {/* Dynamic Grid Rendering - Jumbo-Jester Style */}
          {isLoading || validatingWords ? (
            <div className="flex flex-col items-center justify-center h-36">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mb-3"></div>
              <p className="text-gray-600 text-sm">{validatingWords ? "Validating words..." : "Loading words..."}</p>
            </div>
          ) : (
            <>
              {gridSizes.map((rowSize, rowIndex) => {
                // Calculate starting index for this row
                const startIdx = rowIndex === 0 ? 0 : 
                                 gridSizes.slice(0, rowIndex).reduce((sum, size) => sum + size, 0);
                
                // Calculate ending index (exclusive)
                const endIdx = startIdx + rowSize;
                
                // Get just the cells for this row
                const rowCells = grid.slice(startIdx, endIdx);
                
                return (
                  <div 
                    key={`row-${rowIndex}`} 
                    className="letters-row"
                    style={{
                      marginLeft: rowIndex === 2 ? "20px" : "0px", // Shift the third row as in original design
                      marginTop: rowIndex > 0 ? "7px" : "0px"
                    }}
                  >
                    {rowCells.map((letter, cellIndex) => {
                      const gridIndex = startIdx + cellIndex;
                      return (
                        <div
                          key={gridIndex}
                          onClick={() => selectGridPosition(gridIndex)}
                          className={`letter-slot ${letter ? 'filled' : 'empty'} ${
                            selectedGridIndex === gridIndex ? 'selected' : ''
                          }`}
                        >
                          {letter ? (
                            <div className="shrink-0 w-8 h-[32.34px] relative">
                              <img
                                className="w-8 h-[32.34px] absolute left-0 top-0 overflow-visible"
                                src="/assets/na.png"
                                alt="Icon"
                                style={{
                                  background: 'transparent',
                                  mixBlendMode: 'multiply',
                                  filter: 'brightness(1.3) contrast(1.2) saturate(0.7) hue-rotate(-30deg)'
                                }}
                              />
                              <div
                                className="text-center text-[17.2px] font-normal uppercase absolute left-[8.6px] top-[2.88px] w-[13.07px] h-[17.19px] text-black"
                                style={{ 
                                  transformOrigin: "0 0", 
                                  transform: "rotate(0deg) scale(1, 1)",
                                  textShadow: "none",
                                  WebkitTextStroke: "none"
                                }}
                              >
                                {letter}
                              </div>
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </>
          )}
          </div>
        </div>
      </div>

      {/* Timer and Action Section */}
      <div className="timer-section py-1 mb-0">
        <div className="timer-wrapper mb-1">
          <div className="timer-display">
            <img src="/assets/timer-black.png" alt="Timer" width={16} height={16} />
            <span className="timer-text text-[#ffffff] text-left font-normal">
              {gameStarted ? formatTime(timer) : '--'}
            </span>
        </div>
        </div>
        
        <div className="action-buttons pb-0 mb-0">
          <div className="action-button mb-0" onClick={handleHintClick}>
            <div className="button-icon">
              <img src="/assets/hint.png" alt="Hint" width={50} height={50} />
        </div>
            <span className="button-count text-[#ffffff] text-left font-normal">{hints !== null ? Math.min(hints, 3) : 0}/3{hintCountdown ? ` (${hintCountdown})` : ''}</span>
        </div>
          
          <div className="action-buttons-row mb-0">
            <div className="action-button" onClick={handleShuffleClick}>
              <div className="button-icon">
                <img src="/assets/shuffle.png" alt="Shuffle" width={50} height={50} />
        </div>
              <span className="button-count text-[#ffffff] text-left font-normal">{shuffles !== null ? Math.min(shuffles, 3) : 0}/3{shuffleCountdown ? ` (${shuffleCountdown})` : ''}</span>
      </div>
            
            <div
              className="action-button"
              onClick={watchAdForGems}
            >
              <div className="button-icon">
                <img src="/assets/ads.png" alt="Ads" width={50} height={50} />
      </div>
              <span className="button-text text-[#ffffff] text-left font-normal">ads</span>
            </div>
          </div>
        </div>
      </div>

      {/* Letter Rack */}
      <div className="letter-rack mt-0 pt-0 mb-4 pb-4">
        {letters.map((letter, index) => (
          <div
            key={index}
            className={`letter-tile rack-tile ${selectedLetterIndex === index ? 'selected' : ''}`}
            onClick={() => selectLetter(index)}
          >
            <div className="shrink-0 w-8 h-[32.34px] relative">
              <img
                className="w-8 h-[32.34px] absolute left-0 top-0 overflow-visible"
                src="/assets/na.png"
                alt="Icon"
                style={{ opacity: letter ? 1 : 0.35 }}
              />
              <div
                className="text-center text-[17.2px] font-normal uppercase absolute left-[8.6px] top-[2.88px] w-[13.07px] h-[17.19px] text-black"
                style={{ 
                  transformOrigin: "0 0", 
                  transform: "rotate(0deg) scale(1, 1)",
                  textShadow: "none",
                  WebkitTextStroke: "none",
                  visibility: letter ? 'visible' : 'hidden'
                }}
              >
                {letter}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Play Button */}
      <div className="play-button-container mt-6 pt-6 mb-4">
        <button
          className="play-button"
          onClick={() => {
            if (isLoading || validatingWords) return;
            if (!gameStarted) {
              initializeGame();
            } else {
              checkAnswers();
            }
          }}
          disabled={isLoading || validatingWords || (availableTrials <= 0 && !gameStarted)}
          style={{
            background: isLoading || validatingWords || (availableTrials <= 0 && !gameStarted)
              ? '#9CA3AF'
              : '#18325B',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 'bold',
            border: 'none',
            cursor: isLoading || validatingWords || (availableTrials <= 0 && !gameStarted) ? 'not-allowed' : 'pointer',
            minWidth: '200px',
            minHeight: '45px',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
          }}
          onMouseEnter={(e) => {
            if (!isLoading && !validatingWords && !(availableTrials <= 0 && !gameStarted)) {
              e.target.style.background = '#1e40af';
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 12px rgba(0,0,0,0.3)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isLoading && !validatingWords && !(availableTrials <= 0 && !gameStarted)) {
              e.target.style.background = '#18325B';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
            }
          }}
        >
          {isLoading
            ? "LOADING..."
            : validatingWords
              ? "VALIDATING..."
              : gameStarted
                ? "SUBMIT WORDS"
                : availableTrials <= 0
                  ? "NO TRIALS LEFT"
                  : "START GAME"}
        </button>
      </div>

      {/* Responsive Design Styles - Matching Jumbo-Jester Pattern */}
      <style jsx>{`
        @media (min-width: 1200px) {
          .game-play-word-formed-point-awarded {
            max-width: 1200px;
            margin: 0 auto;
          }
          
          .topmost-white-container {
            max-width: 1200px;
            margin: 0 auto;
          }
          
          .header {
            padding: 1.5rem 2rem;
            gap: 2rem;
          }
          
          .user-profile {
            gap: 0.75rem;
          }
          
          .user-profile .shrink-0 {
            width: 3rem;
            height: 3rem;
          }
          
          .user-profile .shrink-0 img {
            width: 3rem;
            height: 3rem;
          }
          
          .user-profile span {
            font-size: 0.875rem;
          }
          
          .currency-display {
            gap: 1.5rem;
          }
          
          .currency-item {
            gap: 0.5rem;
            padding: 0.5rem 0.75rem;
          }
          
          .currency-item img {
            width: 24px;
            height: 24px;
          }
          
          .currency-item span {
            font-size: 0.875rem;
          }
          
          .board-content {
            width: 400px;
            height: 320px;
            padding: 20px;
            gap: 12px;
          }
          
          .corner-circle-top-left {
            width: 24px;
            height: 24px;
            top: 8px;
            left: 8px;
          }
          
          .corner-circle-top-right {
            width: 24px;
            height: 24px;
            top: 8px;
            right: 8px;
          }
          
          .corner-circle-bottom-left {
            width: 24px;
            height: 24px;
            bottom: 8px;
            left: 8px;
          }
          
          .corner-circle-bottom-right {
            width: 24px;
            height: 24px;
            bottom: 8px;
            right: 8px;
          }
          
          .letter-tile, .letter-slot {
            width: 60px;
            height: 60px;
            font-size: 24px;
          }
          
          .timer-section {
            margin: 16px auto;
            padding: 20px;
            max-width: 600px;
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          
          .action-buttons {
            align-items: flex-start;
            width: 100%;
          }
          
          .action-buttons-row {
            justify-content: flex-start;
            gap: 20px;
          }
          
          .action-buttons-row .action-button:last-child {
            margin-left: auto;
          }
          
          .letter-rack {
            margin: 16px auto;
            padding: 20px;
            max-width: 600px;
            gap: 12px;
          }
          
          .play-button-container {
            margin: 16px auto;
            padding: 16px;
            max-width: 600px;
          }
          
          .play-button img {
            width: 300px !important;
            height: 70px !important;
          }
        }

        @media (min-width: 992px) and (max-width: 1199px) {
          .game-play-word-formed-point-awarded {
            max-width: 1000px;
            margin: 0 auto;
          }
          
          .topmost-white-container {
            max-width: 1000px;
            margin: 0 auto;
          }
          
          .header {
            padding: 1.25rem 1.5rem;
            gap: 1.5rem;
          }
          
          .user-profile {
            gap: 0.625rem;
          }
          
          .user-profile .shrink-0 {
            width: 2.5rem;
            height: 2.5rem;
          }
          
          .user-profile .shrink-0 img {
            width: 2.5rem;
            height: 2.5rem;
          }
          
          .user-profile span {
            font-size: 0.8125rem;
          }
          
          .currency-display {
            gap: 1.25rem;
          }
          
          .currency-item {
            gap: 0.375rem;
            padding: 0.375rem 0.625rem;
          }
          
          .currency-item img {
            width: 22px;
            height: 22px;
          }
          
          .currency-item span {
            font-size: 0.8125rem;
          }
          
          .board-content {
            width: 350px;
            height: 280px;
            padding: 18px;
            gap: 10px;
          }
          
          .corner-circle-top-left {
            width: 22px;
            height: 22px;
            top: 6px;
            left: 6px;
          }
          
          .corner-circle-top-right {
            width: 22px;
            height: 22px;
            top: 6px;
            right: 6px;
          }
          
          .corner-circle-bottom-left {
            width: 22px;
            height: 22px;
            bottom: 6px;
            left: 6px;
          }
          
          .corner-circle-bottom-right {
            width: 22px;
            height: 22px;
            bottom: 6px;
            right: 6px;
          }
          
          .letter-tile, .letter-slot {
            width: 50px;
            height: 50px;
            font-size: 20px;
          }
          
          .timer-section {
            margin: 14px auto;
            padding: 18px;
            max-width: 500px;
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          
          .action-buttons {
            align-items: flex-start;
            width: 100%;
          }
          
          .action-buttons-row {
            justify-content: flex-start;
            gap: 18px;
          }
          
          .action-buttons-row .action-button:last-child {
            margin-left: auto;
          }
          
          .letter-rack {
            margin: 14px auto;
            padding: 18px;
            max-width: 500px;
            gap: 10px;
          }
          
          .play-button-container {
            margin: 14px auto;
            padding: 14px;
            max-width: 500px;
          }
          
          .play-button img {
            width: 250px !important;
            height: 60px !important;
          }
        }

        @media (min-width: 769px) and (max-width: 991px) {
          .game-play-word-formed-point-awarded {
            max-width: 800px;
            margin: 0 auto;
          }
          
          .topmost-white-container {
            max-width: 800px;
            margin: 0 auto;
          }
          
          .header {
            padding: 1rem 1.25rem;
            gap: 1.25rem;
          }
          
          .user-profile {
            gap: 0.5rem;
          }
          
          .user-profile .shrink-0 {
            width: 2.25rem;
            height: 2.25rem;
          }
          
          .user-profile .shrink-0 img {
            width: 2.25rem;
            height: 2.25rem;
          }
          
          .user-profile span {
            font-size: 0.75rem;
          }
          
          .currency-display {
            gap: 1rem;
          }
          
          .currency-item {
            gap: 0.25rem;
            padding: 0.25rem 0.5rem;
          }
          
          .currency-item img {
            width: 20px;
            height: 20px;
          }
          
          .currency-item span {
            font-size: 0.75rem;
          }
          
          .board-content {
            width: 300px;
            height: 240px;
            padding: 16px;
            gap: 8px;
          }
          
          .corner-circle-top-left {
            width: 20px;
            height: 20px;
            top: 5px;
            left: 5px;
          }
          
          .corner-circle-top-right {
            width: 20px;
            height: 20px;
            top: 5px;
            right: 5px;
          }
          
          .corner-circle-bottom-left {
            width: 20px;
            height: 20px;
            bottom: 5px;
            left: 5px;
          }
          
          .corner-circle-bottom-right {
            width: 20px;
            height: 20px;
            bottom: 5px;
            right: 5px;
          }
          
          .letter-tile, .letter-slot {
            width: 42px;
            height: 42px;
            font-size: 18px;
          }
          
          .timer-section {
            margin: 12px auto;
            padding: 16px;
            max-width: 400px;
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          
          .action-buttons {
            align-items: flex-start;
            width: 100%;
          }
          
          .action-buttons-row {
            justify-content: flex-start;
            gap: 16px;
          }
          
          .action-buttons-row .action-button:last-child {
            margin-left: auto;
          }
          
          .letter-rack {
            margin: 12px auto;
            padding: 16px;
            max-width: 400px;
            gap: 8px;
          }
          
          .play-button-container {
            margin: 12px auto;
            padding: 12px;
            max-width: 400px;
          }
          
          .play-button img {
            width: 220px !important;
            height: 50px !important;
          }
        }

        @media (min-width: 481px) and (max-width: 768px) {
          .game-play-word-formed-point-awarded {
            max-height: 100vh;
            overflow-y: auto;
          }
          
          .topmost-white-container {
            margin-bottom: 0.5rem;
          }
          
          .header {
            padding: 0.75rem 1rem;
            gap: 1rem;
          }
          
          .user-profile {
            gap: 0.375rem;
          }
          
          .user-profile .shrink-0 {
            width: 2rem;
            height: 2rem;
          }
          
          .user-profile .shrink-0 img {
            width: 2rem;
            height: 2rem;
          }
          
          .user-profile span {
            font-size: 0.6875rem;
          }
          
          .currency-display {
            gap: 0.75rem;
          }
          
          .currency-item {
            gap: 0.25rem;
            padding: 0.25rem 0.375rem;
          }
          
          .currency-item img {
            width: 18px;
            height: 18px;
          }
          
          .currency-item span {
            font-size: 0.6875rem;
          }
          
          .board-content {
            width: 260px;
            height: 200px;
            padding: 12px;
            gap: 6px;
          }
          
          .corner-circle-top-left {
            width: 18px;
            height: 18px;
            top: 4px;
            left: 4px;
          }
          
          .corner-circle-top-right {
            width: 18px;
            height: 18px;
            top: 4px;
            right: 4px;
          }
          
          .corner-circle-bottom-left {
            width: 18px;
            height: 18px;
            bottom: 4px;
            left: 4px;
          }
          
          .corner-circle-bottom-right {
            width: 18px;
            height: 18px;
            bottom: 4px;
            right: 4px;
          }
          
          .letter-tile, .letter-slot {
            width: 36px;
            height: 36px;
            font-size: 16px;
          }
          
          .timer-section {
            margin: 6px 12px;
            padding: 10px;
          }
          
          .letter-rack {
            margin: 6px auto;
            padding: 10px;
            gap: 6px;
            margin-bottom: 6px;
            width: fit-content;
            max-width: 90%;
          }
          
          .play-button-container {
            padding: 6px 12px;
            margin: 6px auto;
            min-height: 50px;
            display: flex;
            justify-content: center;
            align-items: center;
            max-width: 90%;
          }
          
          .action-buttons-row {
            justify-content: flex-start;
          }
          
          .action-buttons-row .action-button:last-child {
            margin-left: auto;
          }
          
          .play-button {
            min-width: 180px;
            min-height: 40px;
          }
          
          .play-button img {
            width: 180px !important;
            height: 40px !important;
          }
        }

        @media (min-height: 1000px) {
          .game-play-word-formed-point-awarded {
            padding-top: 0;
          }
          .topmost-white-container {
            margin-bottom: 2.5rem;
            padding: 2rem;
          }
          .board-content {
            width: 500px;
            height: 420px;
            padding: 30px;
            gap: 18px;
          }
          
          .corner-circle-top-left {
            width: 28px;
            height: 28px;
            top: 10px;
            left: 10px;
          }
          
          .corner-circle-top-right {
            width: 28px;
            height: 28px;
            top: 10px;
            right: 10px;
          }
          
          .corner-circle-bottom-left {
            width: 28px;
            height: 28px;
            bottom: 10px;
            left: 10px;
          }
          
          .corner-circle-bottom-right {
            width: 28px;
            height: 28px;
            bottom: 10px;
            right: 10px;
          }
          
          .letter-tile, .letter-slot {
            width: 80px;
            height: 80px;
            font-size: 32px;
          }
          .timer-section {
            margin: 2rem 8px;
            padding: 2rem;
          }
          .letter-rack {
            margin: 20px;
            padding: 2rem;
            margin-bottom: 20px;
          }
          .play-button-container {
            margin: 20px;
            padding: 2rem;
          }
        }

        @media (min-height: 900px) {
          .game-play-word-formed-point-awarded {
            padding-top: 0;
          }
          .topmost-white-container {
            margin-bottom: 2rem;
            padding: 1.5rem;
          }
          .board-content {
            width: 450px;
            height: 380px;
            padding: 25px;
            gap: 15px;
          }
          
          .corner-circle-top-left {
            width: 26px;
            height: 26px;
            top: 8px;
            left: 8px;
          }
          
          .corner-circle-top-right {
            width: 26px;
            height: 26px;
            top: 8px;
            right: 8px;
          }
          
          .corner-circle-bottom-left {
            width: 26px;
            height: 26px;
            bottom: 8px;
            left: 8px;
          }
          
          .corner-circle-bottom-right {
            width: 26px;
            height: 26px;
            bottom: 8px;
            right: 8px;
          }
          
          .letter-tile, .letter-slot {
            width: 70px;
            height: 70px;
            font-size: 28px;
          }
          .timer-section {
            margin: 1.5rem 8px;
            padding: 1.5rem;
          }
          .letter-rack {
            margin: 15px;
            padding: 1.5rem;
            margin-bottom: 15px;
          }
          .play-button-container {
            margin: 15px;
            padding: 1.5rem;
          }
        }

        @media (min-height: 800px) {
          .game-play-word-formed-point-awarded {
            padding-top: 0;
          }
          .topmost-white-container {
            margin-bottom: 1.5rem;
            padding: 1.25rem;
          }
          .board-content {
            width: 400px;
            height: 340px;
            padding: 22px;
            gap: 12px;
          }
          
          .corner-circle-top-left {
            width: 24px;
            height: 24px;
            top: 7px;
            left: 7px;
          }
          
          .corner-circle-top-right {
            width: 24px;
            height: 24px;
            top: 7px;
            right: 7px;
          }
          
          .corner-circle-bottom-left {
            width: 24px;
            height: 24px;
            bottom: 7px;
            left: 7px;
          }
          
          .corner-circle-bottom-right {
            width: 24px;
            height: 24px;
            bottom: 7px;
            right: 7px;
          }
          
          .letter-tile, .letter-slot {
            width: 65px;
            height: 65px;
            font-size: 26px;
          }
          .timer-section {
            margin: 1.25rem 8px;
            padding: 1.25rem;
          }
          .letter-rack {
            margin: 12px;
            padding: 1.25rem;
            margin-bottom: 12px;
          }
          .play-button-container {
            margin: 12px;
            padding: 1.25rem;
          }
        }

        @media (min-width: 540px) and (max-width: 540px) and (min-height: 720px) and (max-height: 720px) {
          .game-play-word-formed-point-awarded {
            padding-top: 0;
            height: 100vh;
            overflow: hidden;
            display: flex;
            flex-direction: column;
          }
          .topmost-white-container {
            margin-bottom: 0.125rem;
            padding: 0.25rem;
            flex-shrink: 0;
          }
          .header {
            padding: 0.25rem 0.5rem;
            gap: 0.5rem;
          }
          .user-profile {
            gap: 0.125rem;
          }
          .user-profile .shrink-0 {
            width: 1.25rem;
            height: 1.25rem;
          }
          .user-profile .shrink-0 img {
            width: 1.25rem;
            height: 1.25rem;
          }
          .user-profile span {
            font-size: 0.5rem;
          }
          .currency-display {
            gap: 0.25rem;
          }
          .currency-item {
            gap: 0.125rem;
            padding: 0.125rem 0.25rem;
          }
          .currency-item img {
            width: 12px;
            height: 12px;
          }
          .currency-item span {
            font-size: 0.5rem;
          }
          .board-content {
            width: 240px;
            height: 160px;
            padding: 8px;
            gap: 4px;
          }
          
          .corner-circle-top-left {
            width: 12px;
            height: 12px;
            top: 2px;
            left: 2px;
          }
          
          .corner-circle-top-right {
            width: 12px;
            height: 12px;
            top: 2px;
            right: 2px;
          }
          
          .corner-circle-bottom-left {
            width: 12px;
            height: 12px;
            bottom: 2px;
            left: 2px;
          }
          
          .corner-circle-bottom-right {
            width: 12px;
            height: 12px;
            bottom: 2px;
            right: 2px;
          }
          
          .letter-tile, .letter-slot {
            width: 40px;
            height: 40px;
            font-size: 16px;
          }
          .timer-section {
            margin: 0.125rem 4px;
            padding: 0.25rem;
            flex-shrink: 0;
          }
          .letter-rack {
            margin: 0.125rem;
            padding: 0.25rem;
            margin-bottom: 0.125rem;
            flex-shrink: 0;
          }
          .play-button-container {
            margin: 0.125rem;
            padding: 0.25rem;
            flex-shrink: 0;
          }
          .play-button {
            min-width: 140px;
            min-height: 30px;
            font-size: 12px;
            padding: 8px 16px;
          }
        }

        @media (min-height: 720px) and (max-height: 750px) {
          .game-play-word-formed-point-awarded {
            padding-top: 0;
            height: 100vh;
            overflow: hidden;
            display: flex;
            flex-direction: column;
          }
          .topmost-white-container {
            margin-bottom: 0.25rem;
            padding: 0.5rem;
            flex-shrink: 0;
          }
          .board-content {
            width: 280px;
            height: 200px;
            padding: 12px;
            gap: 6px;
          }
          
          .corner-circle-top-left {
            width: 16px;
            height: 16px;
            top: 3px;
            left: 3px;
          }
          
          .corner-circle-top-right {
            width: 16px;
            height: 16px;
            top: 3px;
            right: 3px;
          }
          
          .corner-circle-bottom-left {
            width: 16px;
            height: 16px;
            bottom: 3px;
            left: 3px;
          }
          
          .corner-circle-bottom-right {
            width: 16px;
            height: 16px;
            bottom: 3px;
            right: 3px;
          }
          
          .letter-tile, .letter-slot {
            width: 48px;
            height: 48px;
            font-size: 20px;
          }
          .timer-section {
            margin: 0.25rem 8px;
            padding: 0.5rem;
            flex-shrink: 0;
          }
          .letter-rack {
            margin: 0.25rem;
            padding: 0.5rem;
            margin-bottom: 0.25rem;
            flex-shrink: 0;
          }
          .play-button-container {
            margin: 0.25rem;
            padding: 0.5rem;
            flex-shrink: 0;
          }
          .play-button {
            min-width: 160px;
            min-height: 35px;
            font-size: 14px;
          }
        }

        @media (min-height: 700px) {
          .game-play-word-formed-point-awarded {
            padding-top: 0;
          }
          .topmost-white-container {
            margin-bottom: 1rem;
            padding: 1rem;
          }
          .board-content {
            width: 350px;
            height: 300px;
            padding: 20px;
            gap: 10px;
          }
          
          .corner-circle-top-left {
            width: 22px;
            height: 22px;
            top: 6px;
            left: 6px;
          }
          
          .corner-circle-top-right {
            width: 22px;
            height: 22px;
            top: 6px;
            right: 6px;
          }
          
          .corner-circle-bottom-left {
            width: 22px;
            height: 22px;
            bottom: 6px;
            left: 6px;
          }
          
          .corner-circle-bottom-right {
            width: 22px;
            height: 22px;
            bottom: 6px;
            right: 6px;
          }
          
          .letter-tile, .letter-slot {
            width: 60px;
            height: 60px;
            font-size: 24px;
          }
          .timer-section {
            margin: 1rem 8px;
            padding: 1rem;
          }
          .letter-rack {
            margin: 10px;
            padding: 1rem;
            margin-bottom: 10px;
          }
          .play-button-container {
            margin: 10px;
            padding: 1rem;
          }
        }

        @media (min-height: 701px) and (max-height: 750px) {
          .board-content {
            width: 220px;
            height: 160px;
            padding: 0.65rem;
            gap: 0.32rem;
          }
          
          .corner-circle-top-left {
            width: 16px;
            height: 16px;
            top: 3px;
            left: 3px;
          }
          
          .corner-circle-top-right {
            width: 16px;
            height: 16px;
            top: 3px;
            right: 3px;
          }
          
          .corner-circle-bottom-left {
            width: 16px;
            height: 16px;
            bottom: 3px;
            left: 3px;
          }
          
          .corner-circle-bottom-right {
            width: 16px;
            height: 16px;
            bottom: 3px;
            right: 3px;
          }
          
          .letter-tile, .letter-slot {
            width: 1.95rem;
            height: 1.95rem;
            font-size: 1rem;
          }
          .timer-section {
            margin: 0.5rem 0.4rem;
            padding: 0.65rem;
          }
          .letter-rack {
            margin: 0.4rem;
            padding: 0.65rem;
            margin-bottom: 0.4rem;
          }
          .play-button-container {
            margin: 0.4rem;
            padding: 0.4rem;
          }
          .play-button img {
            width: 180px !important;
            height: 40px !important;
          }
        }

        @media (min-height: 650px) and (max-height: 700px) {
          .board-content {
            width: 200px;
            height: 150px;
            padding: 0.6rem;
            gap: 0.3rem;
          }
          
          .corner-circle-top-left {
            width: 14px;
            height: 14px;
            top: 2px;
            left: 2px;
          }
          
          .corner-circle-top-right {
            width: 14px;
            height: 14px;
            top: 2px;
            right: 2px;
          }
          
          .corner-circle-bottom-left {
            width: 14px;
            height: 14px;
            bottom: 2px;
            left: 2px;
          }
          
          .corner-circle-bottom-right {
            width: 14px;
            height: 14px;
            bottom: 2px;
            right: 2px;
          }
          
          .letter-tile, .letter-slot {
            width: 1.9rem;
            height: 1.9rem;
            font-size: 0.95rem;
          }
          .timer-section {
            margin: 0.45rem 0.35rem;
            padding: 0.6rem;
          }
          .letter-rack {
            margin: 0.35rem;
            padding: 0.6rem;
            margin-bottom: 0.35rem;
          }
          .play-button-container {
            margin: 0.35rem;
            padding: 0.35rem;
          }
          .play-button img {
            width: 160px !important;
            height: 36px !important;
          }
        }

        @media (min-height: 600px) and (max-height: 650px) {
          .board-content {
            width: 180px;
            height: 130px;
            padding: 0.5rem;
            gap: 0.25rem;
          }
          
          .corner-circle-top-left {
            width: 12px;
            height: 12px;
            top: 2px;
            left: 2px;
          }
          
          .corner-circle-top-right {
            width: 12px;
            height: 12px;
            top: 2px;
            right: 2px;
          }
          
          .corner-circle-bottom-left {
            width: 12px;
            height: 12px;
            bottom: 2px;
            left: 2px;
          }
          
          .corner-circle-bottom-right {
            width: 12px;
            height: 12px;
            bottom: 2px;
            right: 2px;
          }
          
          .letter-tile, .letter-slot {
            width: 1.75rem;
            height: 1.75rem;
            font-size: 0.875rem;
          }
          .timer-section {
            margin: 0.375rem 0.25rem;
            padding: 0.5rem;
          }
          .letter-rack {
            margin: 0.25rem;
            padding: 0.5rem;
            margin-bottom: 0.25rem;
          }
          .play-button-container {
            margin: 0.25rem;
            padding: 0.25rem;
          }
          .play-button img {
            width: 140px !important;
            height: 32px !important;
          }
        }

        @media (min-height: 550px) and (max-height: 600px) {
          .board-content {
            width: 160px;
            height: 120px;
            padding: 0.4rem;
            gap: 0.2rem;
          }
          
          .corner-circle-top-left {
            width: 10px;
            height: 10px;
            top: 1px;
            left: 1px;
          }
          
          .corner-circle-top-right {
            width: 10px;
            height: 10px;
            top: 1px;
            right: 1px;
          }
          
          .corner-circle-bottom-left {
            width: 10px;
            height: 10px;
            bottom: 1px;
            left: 1px;
          }
          
          .corner-circle-bottom-right {
            width: 10px;
            height: 10px;
            bottom: 1px;
            right: 1px;
          }
          
          .letter-tile, .letter-slot {
            width: 1.6rem;
            height: 1.6rem;
            font-size: 0.8rem;
          }
          .timer-section {
            margin: 0.3rem 0.2rem;
            padding: 0.4rem;
          }
          .letter-rack {
            margin: 0.2rem;
            padding: 0.4rem;
            margin-bottom: 0.2rem;
          }
          .play-button-container {
            margin: 0.2rem;
            padding: 0.2rem;
          }
          .play-button img {
            width: 120px !important;
            height: 28px !important;
          }
        }

        @media (min-height: 500px) and (max-height: 550px) {
          .board-content {
            width: 140px;
            height: 100px;
            padding: 0.3rem;
            gap: 0.18rem;
          }
          
          .corner-circle-top-left {
            width: 8px;
            height: 8px;
            top: 1px;
            left: 1px;
          }
          
          .corner-circle-top-right {
            width: 8px;
            height: 8px;
            top: 1px;
            right: 1px;
          }
          
          .corner-circle-bottom-left {
            width: 8px;
            height: 8px;
            bottom: 1px;
            left: 1px;
          }
          
          .corner-circle-bottom-right {
            width: 8px;
            height: 8px;
            bottom: 1px;
            right: 1px;
          }
          
          .letter-tile, .letter-slot {
            width: 1.45rem;
            height: 1.45rem;
            font-size: 0.76rem;
          }
          .timer-section {
            margin: 0.25rem 0.18rem;
            padding: 0.3rem;
          }
          .letter-rack {
            margin: 0.18rem;
            padding: 0.3rem;
            margin-bottom: 0.18rem;
          }
          .play-button-container {
            margin: 0.18rem;
            padding: 0.18rem;
          }
          .play-button img {
            width: 100px !important;
            height: 24px !important;
          }
        }

        @media (max-height: 499px) {
          .board-content {
            width: 120px;
            height: 80px;
            padding: 0.15rem;
            gap: 0.125rem;
          }
          
          .corner-circle-top-left {
            width: 6px;
            height: 6px;
            top: 0px;
            left: 0px;
          }
          
          .corner-circle-top-right {
            width: 6px;
            height: 6px;
            top: 0px;
            right: 0px;
          }
          
          .corner-circle-bottom-left {
            width: 6px;
            height: 6px;
            bottom: 0px;
            left: 0px;
          }
          
          .corner-circle-bottom-right {
            width: 6px;
            height: 6px;
            bottom: 0px;
            right: 0px;
          }
          
          .letter-tile, .letter-slot {
            width: 1.3rem;
            height: 1.3rem;
            font-size: 0.73rem;
          }
          .timer-section {
            margin: 0.15rem 0.125rem;
            padding: 0.15rem;
          }
          .letter-rack {
            margin: 0.125rem;
            padding: 0.15rem;
            margin-bottom: 0.125rem;
          }
          .play-button-container {
            margin: 0.125rem;
            padding: 0.125rem;
          }
          .play-button img {
            width: 80px !important;
            height: 20px !important;
          }
        }

        @media (max-width: 360px) {
          .header {
            padding: 0.375rem 0.5rem;
            gap: 0.5rem;
            flex-wrap: wrap;
            justify-content: space-between;
          }
          
          .user-profile {
            gap: 0.25rem;
            flex-shrink: 0;
          }
          
          .user-profile .shrink-0 {
            width: 1.5rem;
            height: 1.5rem;
          }
          
          .user-profile .shrink-0 img {
            width: 1.5rem;
            height: 1.5rem;
          }
          
          .user-profile span {
            font-size: 0.5625rem;
            white-space: nowrap;
          }
          
          .currency-display {
            gap: 0.375rem;
            flex-wrap: wrap;
            justify-content: flex-end;
          }
          
          .currency-item {
            gap: 0.125rem;
            padding: 0.125rem 0.1875rem;
            min-width: fit-content;
            flex-shrink: 0;
          }
          
          .currency-item img {
            width: 14px;
            height: 14px;
          }
          
          .currency-item span {
            font-size: 0.5625rem;
            white-space: nowrap;
          }
          
          .action-buttons-row {
            justify-content: flex-start;
          }
          
          .action-buttons-row .action-button:last-child {
            margin-left: auto;
          }
        }

        @media (max-width: 480px) {
          .header {
            padding: 0.5rem 0.75rem;
            gap: 0.75rem;
            flex-wrap: wrap;
          }
          
          .user-profile {
            gap: 0.25rem;
          }
          
          .user-profile .shrink-0 {
            width: 1.75rem;
            height: 1.75rem;
          }
          
          .user-profile .shrink-0 img {
            width: 1.75rem;
            height: 1.75rem;
          }
          
          .user-profile span {
            font-size: 0.625rem;
          }
          
          .currency-display {
            gap: 0.5rem;
            flex-wrap: wrap;
          }
          
          .currency-item {
            gap: 0.125rem;
            padding: 0.125rem 0.25rem;
            min-width: fit-content;
          }
          
          .currency-item img {
            width: 16px;
            height: 16px;
          }
          
          .currency-item span {
            font-size: 0.625rem;
          }
          
          .action-buttons-row {
            justify-content: flex-start;
          }
          
          .action-buttons-row .action-button:last-child {
            margin-left: auto;
          }
        }
      `}</style>

      {/* Test Buttons removed */}

      {/* Game Toast Modal */}
      <GameToastModal
        title="Game Notification"
        cta={toastCta}
        isVisible={toastVisible}
        watchAds={showWatchAds}
        toastType={toastType}
        message={toastMessage}
        message2={toastMessage2}
        message3={toastMessage3}
        onClose={() => {
          console.log("🔘 Modal X button clicked - Toast Type:", toastType);
          
          if (toastType === 'timeUp' || toastType === 'gameOver') {
            console.log("  → Action: Restart game");
            restartGame();
          } else if (toastType === 'success') {
            console.log("  → Action: Advance to next level");
            nextLevel();
          } else if (toastType === 'continueOptions') {
            console.log("  → Action: Restart game (player chose to quit incomplete level)");
            // X button on continue options should restart game
            restartGame();
          } else {
            console.log("  → Action: Close toast");
            closeToast();
          }
        }}
        onWatchAd={handleWatchAd}
        onWatchAdToContinue={watchAdToContinue}
        onDeductPointsToContinue={deductPointsToContinue}
        onRestartGame={restartGame}
        onPurchaseHint={purchaseHint}
        onPurchaseShuffle={purchaseShuffle}
        onWatchAdForGems={watchAdForGems}
      />
    </div>
  );
};