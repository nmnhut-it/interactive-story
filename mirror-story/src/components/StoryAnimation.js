import React, { useState, useEffect, useRef, useCallback } from 'react';
import MyAudioManager from '../utils/MyAudioManager';

const StoryAnimation = () => {
  const [currentDialogIndex, setCurrentDialogIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [displayedDialogs, setDisplayedDialogs] = useState([]);
  const [isTyping, setIsTyping] = useState(false); // Initially not typing until user starts
  const [isFinished, setIsFinished] = useState(false);
  const [speed, setSpeed] = useState(30); // Milliseconds per character
  const chatContainerRef = useRef(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false); // New state to track audio loading
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [hasStarted, setHasStarted] = useState(false); // Track if story has started
  const [audioPreloaded, setAudioPreloaded] = useState(false); // Track if all audio files have been preloaded
  
  // Initialize audio manager
  const audioManager = useRef(null);
  
  // Initialize audio manager on component mount
  useEffect(() => {
    audioManager.current = new MyAudioManager();
    
    // Set up callback for audio state changes
    audioManager.current.setAudioStateChangeCallback((state) => {
      if (state.hasOwnProperty('isPlayingAudio')) {
        setIsPlayingAudio(state.isPlayingAudio);
      }
      if (state.hasOwnProperty('isAudioLoading')) {
        setIsAudioLoading(state.isAudioLoading);
      }
    });
    
    // Clean up audio resources when component unmounts
    return () => {
      if (audioManager.current) {
        audioManager.current.cleanup();
      }
    };
  }, []);

  // Define promptLessons array to fix ESLint error
  const promptLessons = [
    {
      id: 1,
      icon: "🎯",
      title: "Xác Định Mục Tiêu Rõ Ràng",
      mistake: "Hoàng tử không nêu rõ mục tiêu là tạo ra một chiếc gương.",
      lesson: "Nêu rõ mục tiêu chính của prompt ngay từ đầu. Ví dụ: 'Tạo một chiếc gương thần'."
    },
    {
      id: 2,
      icon: "🔍",
      title: "Cụ Thể Hóa Yêu Cầu",
      mistake: "Hoàng tử mô tả quá chung chung: 'đẹp, tinh xảo, màu xanh'.",
      lesson: "Mô tả chi tiết về những gì bạn thực sự cần. Chi tiết giúp AI hiểu chính xác mong muốn của bạn."
    },
    {
      id: 3,
      icon: "⚠️",
      title: "Nhấn Mạnh Điểm Quan Trọng",
      mistake: "Hoàng tử không nhấn mạnh yếu tố quan trọng nhất là phải phản chiếu khuôn mặt.",
      lesson: "Đánh dấu rõ những yêu cầu quan trọng nhất để AI biết đâu là ưu tiên hàng đầu."
    },
    {
      id: 4,
      icon: "🧩",
      title: "Cung Cấp Bối Cảnh",
      mistake: "Hoàng tử không chia sẻ rằng đã có khung gương vàng sẵn.",
      lesson: "Cung cấp thông tin về bối cảnh, tài nguyên có sẵn hoặc các ràng buộc liên quan."
    }
  ];
  
  const dialogues = [
    {
      id: 1,
      role: "Narrator",
      content: "Ngày xưa có một vị hoàng tử trẻ tuổi tên Minh muốn có một món quà đặc biệt để tặng công chúa nước láng giềng."
    },
    {
      id: 2,
      role: "Hoàng tử Minh",
      content: "Ta muốn ngươi tạo một món quà cho công chúa. Nó phải đẹp, tinh xảo, màu xanh như bầu trời, có hoa văn tinh tế, kích thước vừa phải để cầm tay... À phải rồi, nó cũng cần phản chiếu được khuôn mặt nữa."
    },
    {
      id: 3,
      role: "Narrator",
      content: "Người thợ kim hoàn ghi chép lại và nghĩ thầm:"
    },
    {
      id: 4,
      role: "Người thợ kim hoàn (nghĩ thầm)",
      content: "Thật nhiều yêu cầu lộn xộn. Có vẻ hoàng tử muốn một món trang sức màu xanh."
    },
    {
      id: 5,
      role: "Narrator",
      content: "Ba tháng sau, người thợ mang đến một chiếc vòng cổ ngọc bích xanh tuyệt đẹp."
    },
    {
      id: 6,
      role: "Hoàng tử Minh",
      content: "Sao không phải gương? Ta đã nói là cần phải phản chiếu khuôn mặt mà!"
    },
    {
      id: 7,
      role: "Người thợ kim hoàn",
      content: "Nhưng ngài không nói đó là gương. Tôi nghĩ ngài muốn trang sức màu xanh."
    },
    {
      id: 8,
      role: "Cố vấn hoàng cung",
      content: "Thưa hoàng tử, người thợ không biết ngài đã có khung gương vàng, chỉ cần thêm mặt gương vào."
    },
    {
      id: 9,
      role: "Người thợ kim hoàn",
      content: "Nếu ngài nói rõ 'Ta cần một chiếc gương thần', và nói rõ về yêu cầu chất lượng, tôi đã làm đúng. Ngài cũng không yêu cầu tôi kiểm tra lại hiểu biết của mình."
    },
    {
      id: 10,
      role: "Narrator",
      content: "Cuối cùng, hoàng tử rút ra bài học và yêu cầu lại:"
    },
    {
      id: 11,
      role: "Hoàng tử Minh",
      content: "Ta cần một chiếc gương thần. Nó phải màu xanh, có hoa văn truyền thống. Đây là yêu cầu quan trọng: gương phải rõ nét để phản chiếu khuôn mặt. Ta đã có khung gương vàng, ngươi chỉ cần làm phần mặt gương."
    },
    {
      id: 12,
      role: "Narrator",
      content: "Và đúng như mong đợi, lần này người thợ đã tạo ra một chiếc gương thần tuyệt đẹp, hoàn hảo theo ý hoàng tử."
    }
  ];
  
  // Character emoji mapping for visual flair
  const characterEmojis = {
    "Narrator": "📜",
    "Hoàng tử Minh": "👑", 
    "Người thợ kim hoàn": "⚒️",
    "Người thợ kim hoàn (nghĩ thầm)": "💭",
    "Cố vấn hoàng cung": "🧙‍♂️"
  };
  
  // Role-based colors
  const roleColors = {
    "Narrator": "#555555",
    "Hoàng tử Minh": "#6a0dad", // Purple
    "Người thợ kim hoàn": "#008080", // Teal
    "Người thợ kim hoàn (nghĩ thầm)": "#006666", // Darker teal
    "Cố vấn hoàng cung": "#8b4513" // Brown
  };
  
  // Preload all audio files when component mounts
  useEffect(() => {
    const preloadAllAudio = async () => {
      if (!audioManager.current) return;
      
      // Get all dialogue IDs
      const dialogueIds = dialogues.map(dialogue => dialogue.id);
      
      // Preload all audio files
      const success = await audioManager.current.preloadAllAudio(dialogueIds);
      
      // Mark preloading as complete
      setAudioPreloaded(success);
    };
    
    // Start preloading if not already done
    if (!audioPreloaded && audioManager.current) {
      preloadAllAudio();
    }
  }, [audioPreloaded, dialogues]);

  // Play audio function using the audio manager
  const playAudio = useCallback((dialogId) => {
    if (!audioManager.current) return 0;
    return audioManager.current.playAudio(dialogId, isTyping);
  }, [isTyping]);
  
  // Get currently displayed text
  const displayedText = dialogues[currentDialogIndex]?.content.substring(0, currentCharIndex);
  
  // Type effect with audio synchronization
  useEffect(() => {
    // Don't do anything if we're finished with the story
    if (isFinished || !audioManager.current) return;

    // When a new dialog starts, play its audio and adjust typing speed
    if (currentCharIndex === 0 && isTyping) {
      const dialogId = dialogues[currentDialogIndex].id;
      
      // Update typing speed based on audio duration and text length
      const textLength = dialogues[currentDialogIndex].content.length;
      const newSpeed = audioManager.current.calculateTypingSpeed(dialogId, textLength);
      setSpeed(newSpeed);
      
      // Play the corresponding audio
      playAudio(dialogId);
    }
    
    if (isTyping && currentCharIndex < dialogues[currentDialogIndex]?.content.length) {
      // Normal typing animation
      const timer = setTimeout(() => {
        setCurrentCharIndex(currentCharIndex + 1);
      }, speed);
      return () => clearTimeout(timer);
    } else if (currentCharIndex >= dialogues[currentDialogIndex]?.content.length && !isFinished) {
      // Current dialog typing is complete
      // Wait for audio to finish (or a minimum time if no audio is playing)
      const advanceTimer = setTimeout(() => {
        // Only attempt to advance if we're not already at the end
        if (currentDialogIndex < dialogues.length - 1) {
          // Add the completed dialog to displayed dialogs
          setDisplayedDialogs(prev => {
            // Check if we've already added this dialog to prevent duplicates
            const alreadyExists = prev.some(dialog => 
              dialog.id === dialogues[currentDialogIndex].id
            );
            
            if (alreadyExists) return prev;
            
            return [...prev, {
              ...dialogues[currentDialogIndex],
              completed: true
            }];
          });
          
          // Move to next dialog
          setCurrentDialogIndex(prev => prev + 1);
          setCurrentCharIndex(0);
        } else if (!isFinished) {
          // We've reached the end of all dialogs
          setDisplayedDialogs(prev => {
            // Check if we've already added this dialog to prevent duplicates
            const alreadyExists = prev.some(dialog => 
              dialog.id === dialogues[currentDialogIndex].id
            );
            
            if (alreadyExists) return prev;
            
            return [...prev, {
              ...dialogues[currentDialogIndex],
              completed: true
            }];
          });
          
          // Mark the story as finished
          setIsFinished(true);
        }
      }, isPlayingAudio ? 500 : 1500); // Wait for audio to finish
      
      return () => clearTimeout(advanceTimer);
    }
  }, [currentCharIndex, currentDialogIndex, dialogues, isTyping, speed, voiceEnabled, isPlayingAudio, isFinished, playAudio]);

  // Pause/resume audio when typing is paused/resumed
  useEffect(() => {
    if (!audioManager.current) return;
    
    if (!isTyping) {
      audioManager.current.pauseAudio();
    } else {
      audioManager.current.resumeAudio();
    }
  }, [isTyping]);

  // Scroll chat into view when new content added
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [displayedDialogs, currentCharIndex]);

  // Handle space key to pause/play
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setIsTyping(!isTyping);
      } else if (e.code === 'ArrowRight') {
        if (currentDialogIndex < dialogues.length - 1) {
          // Stop any current audio
          if (audioManager.current) {
            audioManager.current.stopAudio();
          }
          
          // Add the current dialog to displayed dialogs if not already
          if (currentCharIndex > 0) {
            setDisplayedDialogs(prev => [...prev, {
              ...dialogues[currentDialogIndex],
              completed: true
            }]);
          }
          setCurrentDialogIndex(currentDialogIndex + 1);
          setCurrentCharIndex(0);
        }
      } else if (e.code === 'ArrowLeft') {
        if (currentDialogIndex > 0) {
          // Stop any current audio
          if (audioManager.current) {
            audioManager.current.stopAudio();
          }
          
          // Remove the last displayed dialog if needed
          if (displayedDialogs.length > 0 && 
              displayedDialogs[displayedDialogs.length - 1].role === dialogues[currentDialogIndex - 1].role) {
            setDisplayedDialogs(prev => prev.slice(0, -1));
          }
          setCurrentDialogIndex(currentDialogIndex - 1);
          setCurrentCharIndex(0);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTyping, currentDialogIndex, dialogues.length, currentCharIndex, displayedDialogs]);

  // Handle start button click
  const startStory = () => {
    setHasStarted(true);
    setIsTyping(true);
  };
  
  // Toggle voice enabled state
  const toggleVoiceEnabled = () => {
    if (audioManager.current) {
      const newState = audioManager.current.setVoiceEnabled(!voiceEnabled);
      setVoiceEnabled(newState);
    }
  };
  
  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-amber-50 p-4">
      {!hasStarted ? (
        // Welcome screen with start button
        <div className="flex flex-col items-center justify-center h-[70vh] w-full max-w-3xl bg-white rounded-lg shadow-lg p-8 text-center">
          <h1 className="text-4xl font-bold text-amber-800 mb-6">
            <span className="text-3xl mr-2">✨</span>
            Câu Chuyện Chiếc Gương Thần
            <span className="text-3xl ml-2">✨</span>
          </h1>
          <p className="mb-8 text-lg text-gray-600">Bài học Prompt Engineering qua câu chuyện cổ tích</p>
          
          <div className="mb-8 p-6 bg-amber-50 rounded-lg">
            <p className="text-gray-700 mb-3">Câu chuyện này kể về một vị hoàng tử và bài học về cách truyền đạt yêu cầu rõ ràng.</p>
            <p className="text-gray-700 mb-3">Bạn sẽ được nghe giọng đọc kèm theo câu chuyện.</p>
          </div>
          
          <button 
            onClick={startStory} 
            className="px-10 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xl rounded-lg shadow-lg hover:from-amber-600 hover:to-amber-700 flex items-center font-medium transform transition-transform duration-300 hover:scale-105"
          >
            <span className="mr-3 text-2xl">▶️</span>
            Bắt đầu câu chuyện
          </button>
        </div>
      ) : (
        // Story content (only displayed after clicking start)
        <>
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold text-amber-800 inline-block px-6 py-2 bg-white rounded-lg shadow-md border-b-4 border-amber-600">
              <span className="text-2xl mr-2">✨</span>
              Câu Chuyện Chiếc Gương Thần
              <span className="text-2xl ml-2">✨</span>
            </h1>
            <p className="mt-2 text-gray-600 italic">Bài học Prompt Engineering qua câu chuyện cổ tích</p>
          </div>
          
          {/* Sound & Speed controls */}
          <div className="mb-4 flex items-center gap-6 flex-wrap justify-center">
            <div className="flex items-center gap-2">
              <label htmlFor="speed" className="text-sm text-gray-700">Tốc độ văn bản:</label>
              <input 
                type="range" 
                id="speed" 
                min="10" 
                max="100" 
                value={100 - speed} 
                onChange={(e) => setSpeed(100 - parseInt(e.target.value))}
                className="w-32"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-700">Âm thanh:</label>
              <button 
                onClick={toggleVoiceEnabled} 
                className={`p-2 rounded-full ${voiceEnabled ? 'bg-amber-500 text-white' : 'bg-gray-300 text-gray-600'}`}
              >
                {voiceEnabled ? '🔊' : '🔇'}
              </button>
            </div>
          </div>
          
          {/* Controls */}
          <div className="flex flex-wrap gap-4 mb-6 justify-center">
            <button 
              onClick={() => setIsTyping(!isTyping)} 
              className="px-6 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg shadow hover:from-amber-600 hover:to-amber-700 flex items-center font-medium"
            >
              {isTyping ? (
                <><span className="mr-2">⏸️</span> Tạm dừng</>
              ) : (
                <><span className="mr-2">▶️</span> Tiếp tục</>
              )}
            </button>
            <button 
              onClick={() => {
                if (currentDialogIndex > 0) {
                  // Stop any current audio
                  if (audioManager.current) {
                    audioManager.current.stopAudio();
                  }
                  
                  // Remove the last displayed dialog if needed
                  if (displayedDialogs.length > 0 && 
                      displayedDialogs[displayedDialogs.length - 1].role === dialogues[currentDialogIndex - 1].role) {
                    setDisplayedDialogs(prev => prev.slice(0, -1));
                  }
                  setCurrentDialogIndex(currentDialogIndex - 1);
                  setCurrentCharIndex(0);
                }
              }}
              disabled={currentDialogIndex === 0}
              className="px-5 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg shadow hover:from-gray-600 hover:to-gray-700 disabled:opacity-50 flex items-center font-medium"
            >
              <span className="mr-2">◀️</span> Trước
            </button>
            <button 
              onClick={() => {
                if (currentDialogIndex < dialogues.length - 1) {
                  // Stop any current audio
                  if (audioManager.current) {
                    audioManager.current.stopAudio();
                  }
                  
                  // Add the current dialog to displayed dialogs if not already
                  if (currentCharIndex > 0) {
                    setDisplayedDialogs(prev => [...prev, {
                      ...dialogues[currentDialogIndex],
                      completed: true
                    }]);
                  }
                  setCurrentDialogIndex(currentDialogIndex + 1);
                  setCurrentCharIndex(0);
                }
              }}
              disabled={currentDialogIndex === dialogues.length - 1}
              className="px-5 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg shadow hover:from-gray-600 hover:to-gray-700 disabled:opacity-50 flex items-center font-medium"
            >
              <span className="mr-2">▶️</span> Tiếp
            </button>
          </div>
          
          {/* Audio status indicator - subtle visual cue that audio is playing */}
          {isPlayingAudio && voiceEnabled && (
            <div className="flex items-center gap-2 mb-2 text-amber-600">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
              </span>
              <span className="text-sm font-medium">Đang phát</span>
            </div>
          )}
          
          {/* Main content */}
          <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Progress bar */}
            <div className="h-2 bg-gray-200">
              <div 
                className="h-full bg-amber-600 transition-all duration-300" 
                style={{ width: `${((currentDialogIndex) / (dialogues.length - 1)) * 100}%` }}
              ></div>
            </div>
            
            {/* Chat container */}
            <div 
              ref={chatContainerRef} 
              className="p-6 h-96 overflow-y-auto flex flex-col gap-4"
              style={{ scrollBehavior: 'smooth' }}
            >
              {/* Past dialogs */}
              {displayedDialogs.map((dialog, index) => (
                <div key={index} className="flex flex-col">
                  {dialog.role === "Narrator" ? (
                    /* Narrator style - no label, different styling */
                    <div className="text-lg italic text-left w-full text-gray-700 px-4 py-2 bg-amber-100 border-l-4 border-amber-500 rounded">
                      {dialog.content}
                    </div>
                  ) : (
                    /* Other characters - with labels and bubble style */
                    <>
                      <div 
                        className="mb-1 inline-block px-4 py-1 rounded-full text-white text-sm font-medium flex items-center"
                        style={{ backgroundColor: roleColors[dialog.role] || "#333" }}
                      >
                        <span className="mr-2 text-lg">{characterEmojis[dialog.role]}</span>
                        {dialog.role}
                      </div>
                      <div className={`text-lg leading-relaxed text-left p-4 rounded-lg ${
                        dialog.role.includes("Hoàng tử") ? "bg-purple-50" : 
                        dialog.role.includes("thợ kim hoàn") ? "bg-teal-50" : 
                        "bg-amber-50"
                      }`}>
                        {dialog.content}
                      </div>
                    </>
                  )}
                </div>
              ))}
              
              {/* Current typing dialog */}
              {!isFinished && (
                <div className="flex flex-col">
                  {dialogues[currentDialogIndex]?.role === "Narrator" ? (
                    /* Narrator style - no label, different styling */
                    <div className="text-lg italic text-left w-full text-gray-700 px-4 py-2 bg-amber-100 border-l-4 border-amber-500 rounded">
                      {displayedText}
                      {isTyping && <span className="animate-pulse">|</span>}
                    </div>
                  ) : (
                    /* Other characters - with labels and bubble style */
                    <>
                      <div 
                        className="mb-1 inline-block px-4 py-1 rounded-full text-white text-sm font-medium flex items-center"
                        style={{ backgroundColor: roleColors[dialogues[currentDialogIndex]?.role] || "#333" }}
                      >
                        <span className="mr-2 text-lg">{characterEmojis[dialogues[currentDialogIndex]?.role]}</span>
                        {dialogues[currentDialogIndex]?.role}
                      </div>
                      <div className={`text-lg leading-relaxed text-left p-4 rounded-lg ${
                        dialogues[currentDialogIndex]?.role.includes("Hoàng tử") ? "bg-purple-50" : 
                        dialogues[currentDialogIndex]?.role.includes("thợ kim hoàn") ? "bg-teal-50" : 
                        "bg-amber-50"
                      }`}>
                        {displayedText}
                        {isTyping && <span className="animate-pulse">|</span>}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Lesson section remains the same */}
          {isFinished && (
            <div className="w-full max-w-3xl mt-8">
              <h2 className="text-3xl font-bold mb-6 text-center text-amber-800">Bài Học Cho Prompt Engineering</h2>
              
              {/* Modern card-based lesson display */}
              <div className="grid md:grid-cols-2 gap-6">
                {promptLessons.map(lesson => (
                  <div key={lesson.id} className="bg-white rounded-xl shadow-lg overflow-hidden transform transition duration-300 hover:scale-105 border-t-4" style={{borderTopColor: lesson.id % 2 === 0 ? '#06b6d4' : '#f59e0b'}}>
                    <div className="p-6">
                      <div className="flex items-start">
                        <div className="text-3xl mr-3">{lesson.icon}</div>
                        <h3 className="text-xl font-bold">{lesson.title}</h3>
                      </div>
                      
                      <div className="mt-4 p-3 bg-red-50 rounded-lg border-l-4 border-red-400 text-left">
                        <p className="text-gray-700"><span className="font-semibold text-red-600">Lỗi:</span> {lesson.mistake}</p>
                      </div>
                      
                      <div className="mt-3 p-3 bg-green-50 rounded-lg border-l-4 border-green-400 text-left">
                        <p className="text-gray-700"><span className="font-semibold text-green-600">Bài học:</span> {lesson.lesson}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Before/After comparison */}
              <div className="mt-8 bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-amber-600 to-amber-400 py-3 px-6">
                  <h3 className="text-xl font-bold text-white">So Sánh Prompt Trước và Sau</h3>
                </div>
                
                <div className="p-6">
                  <div className="space-y-6">
                    <div className="p-4 bg-red-50 rounded-lg border border-red-200 text-left">
                      <h4 className="flex items-center text-lg font-semibold text-red-600 mb-2">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        Prompt kém hiệu quả
                      </h4>
                      <div className="pl-7">
                        <p className="text-gray-700">"Ta muốn ngươi tạo một món quà cho công chúa. Nó phải đẹp, tinh xảo, màu xanh... và cũng cần phản chiếu được khuôn mặt nữa."</p>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200 text-left">
                      <h4 className="flex items-center text-lg font-semibold text-green-600 mb-2">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Prompt hiệu quả
                      </h4>
                      <div className="pl-7">
                        <p className="text-gray-700">"Ta cần một chiếc gương thần. Nó phải màu xanh, có hoa văn truyền thống. Đây là yêu cầu quan trọng: gương phải rõ nét để phản chiếu khuôn mặt. Ta đã có khung gương vàng, ngươi chỉ cần làm phần mặt gương."</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 text-center">
                <p className="text-amber-800 font-medium">Câu chuyện này minh họa: Khi làm việc với AI, việc truyền đạt yêu cầu một cách rõ ràng sẽ giúp nhận được kết quả chính xác như mong muốn ngay từ lần đầu tiên.</p>
              </div>
            </div>
          )}
          
          <div className="mt-6 text-sm text-gray-500">
            Sử dụng phím Space để tạm dừng/tiếp tục. Phím mũi tên để di chuyển trước/sau.
          </div>
        </>
      )}
    </div>
  );
};

export default StoryAnimation;