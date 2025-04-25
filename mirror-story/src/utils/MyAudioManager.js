/**
 * MyAudioManager - A dedicated audio management class for synchronizing audio with dialogue
 * Handles audio preloading, playback, cleanup, and synchronization with text
 */
class MyAudioManager {
  constructor() {
    this.preloadedAudios = {};
    this.currentAudio = null;
    this.isPlayingAudio = false;
    this.isAudioLoading = false;
    this.audioOperationInProgress = false;
    this.voiceEnabled = true;
    this.onAudioStateChange = null; // Callback for audio state changes
    
    // Audio durations (in milliseconds) based on actual audio file lengths
    this.audioDurations = {
      1: 7000,   // Narrator intro (00:00:07)
      2: 18000,  // Hoàng tử first request (00:00:14)
      3: 5000,   // Narrator transition (00:00:04)
      4: 5000,   // Craftsman thinking (00:00:04)
      5: 6000,   // Narrator description (00:00:05)
      6: 6000,   // Hoàng tử complaint (00:00:05)
      7: 6000,   // Craftsman explanation (00:00:04)
      8: 8000,   // Advisor context (00:00:06)
      9: 12000,  // Craftsman lesson (00:00:10)
      10: 6000,  // Narrator transition (00:00:04)
      11: 20000, // Hoàng tử improved request (00:00:14)
      12: 9000   // Narrator conclusion (00:00:07)
    };
  }

  /**
   * Sets the callback to be called when audio state changes
   * @param {Function} callback - Function to call with state updates
   */
  setAudioStateChangeCallback(callback) {
    this.onAudioStateChange = callback;
  }

  /**
   * Updates audio state and calls the callback if provided
   * @param {Object} state - State object with properties to update
   */
  updateAudioState(state) {
    if (state.hasOwnProperty('isPlayingAudio')) {
      this.isPlayingAudio = state.isPlayingAudio;
    }
    if (state.hasOwnProperty('isAudioLoading')) {
      this.isAudioLoading = state.isAudioLoading;
    }
    if (this.onAudioStateChange) {
      this.onAudioStateChange(state);
    }
  }

  /**
   * Toggle voice enabled state
   * @param {boolean} enabled - Whether voice should be enabled
   */
  setVoiceEnabled(enabled) {
    this.voiceEnabled = enabled;
    if (!enabled && this.currentAudio) {
      this.stopAudio();
    }
    return this.voiceEnabled;
  }

  /**
   * Get audio enabled state
   * @returns {boolean} - Current voice enabled state
   */
  getVoiceEnabled() {
    return this.voiceEnabled;
  }

  /**
   * Preload all audio files for the story
   * @param {Array} dialogueIds - Array of dialogue IDs to preload
   * @returns {Promise} - Promise that resolves when preloading is complete
   */
  async preloadAllAudio(dialogueIds) {
    console.log("Starting to preload all audio files...");
    
    const audioPaths = [];
    
    // Create array of all possible audio paths for each file
    for (const id of dialogueIds) {
      audioPaths.push({
        id,
        paths: [
          `/sound/${id}.wav`,
          `./sound/${id}.wav`,
          `../sound/${id}.wav`
        ]
      });
    }
    
    let loadedCount = 0;
    const totalDialogs = dialogueIds.length;
    
    // Function to try loading each audio with multiple path options
    const loadAudio = async (audioInfo) => {
      const { id, paths } = audioInfo;
      const audio = new Audio();
      
      // Try each path until one works
      for (let j = 0; j < paths.length; j++) {
        const currentPath = paths[j];
        console.log(`Attempting to preload audio ${id} from: ${currentPath}`);
        
        try {
          // Set src and attempt to load
          audio.src = currentPath;
          
          // Use a promise to track when the audio is loaded
          await new Promise((resolve, reject) => {
            // Set a timeout to prevent hanging
            const loadTimeout = setTimeout(() => {
              console.log(`⚠️ Loading timeout for audio ${id} from ${currentPath}`);
              if (j === paths.length - 1) {
                reject(`Loading timeout for audio ${id}`);
              } else {
                resolve("try next");
              }
            }, 5000);
            
            audio.oncanplaythrough = () => {
              clearTimeout(loadTimeout);
              console.log(`✅ Audio ${id} loaded successfully from ${currentPath}`);
              resolve();
            };
            
            audio.onerror = () => {
              clearTimeout(loadTimeout);
              console.log(`❌ Failed to load audio ${id} from ${currentPath}`);
              // Only reject if this is the last path option
              if (j === paths.length - 1) {
                reject(`Could not load audio ${id} from any path`);
              } else {
                // Try next path
                resolve("try next");
              }
            };
          });
          
          // If we got here without hitting onerror, we succeeded
          this.preloadedAudios[id] = {
            audio,
            path: currentPath
          };
          
          loadedCount++;
          console.log(`Progress: ${loadedCount}/${totalDialogs} audio files preloaded`);
          
          // Success! Break the for loop
          break;
        } catch (error) {
          if (error === "try next") {
            // Continue to next path
            continue;
          }
          console.error(`Failed to preload audio ${id}:`, error);
        }
      }
    };
    
    // Load all audio files in parallel with rate limiting
    const concurrentLimit = 3; // Load 3 files at a time to avoid overwhelming the browser
    for (let i = 0; i < audioPaths.length; i += concurrentLimit) {
      const batch = audioPaths.slice(i, i + concurrentLimit);
      await Promise.allSettled(batch.map(loadAudio));
    }
    
    console.log("Audio preloading complete!");
    return true;
  }

  /**
   * Calculate typing speed based on audio duration and text length
   * @param {number} dialogId - The ID of the current dialogue
   * @param {number} textLength - The length of the text to display
   * @returns {number} - The speed in milliseconds per character
   */
  calculateTypingSpeed(dialogId, textLength) {
    // Get the audio duration for this dialog
    const duration = this.audioDurations[dialogId] || 5000; // Default to 5 seconds if not specified
    
    // Calculate a typing speed that will make the text complete in about 
    // 80% of the audio duration (to finish typing before audio ends)
    const totalTypingTime = duration * 0.8;
    
    // Calculate milliseconds per character
    let msPerChar = Math.floor(totalTypingTime / textLength);
    
    // Set boundaries to prevent too fast or too slow typing
    msPerChar = Math.max(10, Math.min(100, msPerChar));
    
    return msPerChar;
  }

  /**
   * Stop current audio if it exists
   */
  stopAudio() {
    if (this.currentAudio) {
      console.log('Stopping audio');
      
      // Clean up event handlers
      this.currentAudio.oncanplaythrough = null;
      this.currentAudio.onended = null;
      this.currentAudio.onplay = null;
      this.currentAudio.onerror = null;
      
      // Stop and reset the audio
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
      
      this.audioOperationInProgress = false;
      this.updateAudioState({ isPlayingAudio: false });
    }
  }

  /**
   * Pause current audio if it exists
   */
  pauseAudio() {
    if (this.currentAudio && !this.currentAudio.paused) {
      this.currentAudio.pause();
      this.updateAudioState({ isPlayingAudio: false });
    }
  }

  /**
   * Resume current audio if it exists and is paused
   */
  resumeAudio() {
    if (this.currentAudio && this.currentAudio.paused && this.voiceEnabled) {
      this.currentAudio.play().catch(e => console.error('Could not resume audio:', e));
    }
  }

  /**
   * Play audio for a specific dialogue ID
   * @param {number} dialogId - The ID of the dialogue to play audio for
   * @param {boolean} isTyping - Whether text typing is currently active
   * @returns {number} - Estimated duration of the audio
   */
  playAudio(dialogId, isTyping) {
    if (!this.voiceEnabled) return 0;
    
    // Prevent race conditions
    if (this.audioOperationInProgress) {
      console.log('Audio operation already in progress, cancelling duplicate request');
      return 0;
    }
    
    this.audioOperationInProgress = true;
    this.updateAudioState({ isAudioLoading: true });
    
    // Stop any currently playing audio
    this.stopAudio();
    
    let audio;
    
    // Check if we have this audio preloaded
    if (this.preloadedAudios[dialogId]) {
      console.log(`Using preloaded audio for dialog ${dialogId}`);
      audio = this.preloadedAudios[dialogId].audio.cloneNode(true); // Clone to avoid issues with simultaneous playback
    } else {
      // Fallback to normal loading if somehow preloading failed
      console.log(`Audio ${dialogId} wasn't preloaded, loading dynamically`);
      audio = new Audio();
      
      // Try multiple paths to find a working audio source
      const soundPaths = [
        `/sound/${dialogId}.wav`,
        `./sound/${dialogId}.wav`,
        `../sound/${dialogId}.wav`
      ];
      
      let currentPathIndex = 0;
      const tryLoadPath = () => {
        if (currentPathIndex >= soundPaths.length) {
          console.error(`All audio loading attempts failed for dialog ${dialogId}`);
          this.updateAudioState({ 
            isPlayingAudio: false,
            isAudioLoading: false
          });
          this.audioOperationInProgress = false;
          return;
        }
        
        const currentPath = soundPaths[currentPathIndex];
        console.log(`Attempting to load audio from: ${currentPath}`);
        
        audio.onerror = () => {
          console.error(`Failed to load audio from ${currentPath}`);
          currentPathIndex++;
          tryLoadPath();
        };
        
        audio.src = currentPath;
      };
      
      tryLoadPath();
    }
    
    // Store reference to current audio
    this.currentAudio = audio;
    
    // Set up loading handler
    audio.oncanplaythrough = () => {
      console.log(`Audio ${dialogId} ready to play`);
      this.updateAudioState({ isAudioLoading: false });
      
      // Only attempt to play if we're still typing
      if (isTyping) {
        // Set up handlers
        audio.onplay = () => {
          console.log(`Audio ${dialogId} started playing`);
          this.updateAudioState({ isPlayingAudio: true });
        };
        
        audio.onended = () => {
          console.log(`Audio ${dialogId} finished playing`);
          
          // Update state
          this.updateAudioState({ isPlayingAudio: false });
          this.audioOperationInProgress = false;
          
          // Clean up to prevent memory leaks and loops
          audio.onplay = null;
          audio.onended = null;
          audio.oncanplaythrough = null;
          audio.onerror = null;
          
          // Force cleanup but don't nullify this.currentAudio yet
          // to allow for checking if the current audio finished naturally
          audio.currentTime = 0;
          audio.pause();
        };
        
        // Use a small timeout to ensure browser is ready
        setTimeout(() => {
          if (isTyping && this.currentAudio === audio) {
            console.log(`Playing audio ${dialogId}`);
            // Explicitly set loop to false
            audio.loop = false;
            
            // Play with error handling
            const playPromise = audio.play();
            
            if (playPromise !== undefined) {
              playPromise
                .then(() => {
                  console.log(`Audio ${dialogId} playback started successfully`);
                })
                .catch(error => {
                  console.error('Audio playback failed:', error);
                  // If autoplay is blocked by browser policy
                  if (error.name === 'NotAllowedError') {
                    console.warn('Audio playback was blocked by browser. User interaction required.');
                  }
                  this.updateAudioState({ isPlayingAudio: false });
                  this.audioOperationInProgress = false;
                });
            }
          } else {
            this.audioOperationInProgress = false;
          }
        }, 100);
      } else {
        this.audioOperationInProgress = false;
      }
    };
    
    // Add a timeout to prevent hanging if audio never loads
    setTimeout(() => {
      if (this.isAudioLoading) {
        console.warn(`Audio loading timeout for dialog ${dialogId}`);
        this.updateAudioState({ isAudioLoading: false });
        this.audioOperationInProgress = false;
      }
    }, 3000);
    
    // Return the estimated duration
    return this.audioDurations[dialogId] || 5000;
  }
  
  /**
   * Check if audio is currently playing
   * @returns {boolean} - Whether audio is playing
   */
  isPlaying() {
    return this.isPlayingAudio;
  }
  
  /**
   * Get the audio duration for a specific dialogue
   * @param {number} dialogId - The ID of the dialogue
   * @returns {number} - The duration in milliseconds
   */
  getAudioDuration(dialogId) {
    return this.audioDurations[dialogId] || 5000;
  }

  /**
   * Clean up all audio resources
   */
  cleanup() {
    this.stopAudio();
    
    // Clean up all preloaded audios
    Object.values(this.preloadedAudios).forEach(item => {
      if (item.audio) {
        item.audio.oncanplaythrough = null;
        item.audio.onended = null;
        item.audio.onplay = null;
        item.audio.onerror = null;
        item.audio.pause();
        item.audio = null;
      }
    });
    
    this.preloadedAudios = {};
  }
}

export default MyAudioManager;