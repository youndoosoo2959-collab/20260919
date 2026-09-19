import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, X, Check, Volume2, Sparkles, Smile, Store, MessageCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { StudentProfile, MissionRecord } from '../types';
import { playChimeSound, playFanfareSound, speakKoreanText, stopSpeech } from '../services/soundEffects';

interface GreetingMissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: StudentProfile;
  onComplete: (record: Omit<MissionRecord, 'id' | 'timestamp'>) => void;
}

export const GreetingMissionModal: React.FC<GreetingMissionModalProps> = ({
  isOpen,
  onClose,
  student,
  onComplete,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [spokenText, setSpokenText] = useState<string>('');
  const [sttSupported, setSttSupported] = useState(true);
  const [managerReaction, setManagerReaction] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Friendly voice instruction on opening
  useEffect(() => {
    if (isOpen) {
      setSpokenText('');
      setManagerReaction(null);
      setIsSuccess(false);
      setIsListening(false);

      speakKoreanText('마트 인사 미션! 친절한 점장님께 "안녕하세요!" 하고 큰 소리로 인사해보세요!');

      // Check SpeechRecognition support
      const SpeechRecognitionClass =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognitionClass) {
        setSttSupported(true);
      } else {
        setSttSupported(false);
      }
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
      stopSpeech();
    }
  }, [isOpen]);

  const handleStartListening = () => {
    if (isSuccess) return;

    const SpeechRecognitionClass =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setSttSupported(false);
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      const recognition = new SpeechRecognitionClass();
      recognition.lang = 'ko-KR';
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 3;

      recognition.onstart = () => {
        setIsListening(true);
        playChimeSound();
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setSpokenText(transcript);

        // Flexible success criteria: '안녕', '반갑', '좋은', '어서', '하이', '예'
        const lower = transcript.toLowerCase();
        const isGreetingSuccess =
          lower.includes('안녕') ||
          lower.includes('하세') ||
          lower.includes('반갑') ||
          lower.includes('반가') ||
          lower.includes('어서') ||
          lower.includes('좋은') ||
          transcript.trim().length >= 2;

        if (isGreetingSuccess) {
          recognition.stop();
          triggerSuccess(transcript || '안녕하세요!');
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.warn('Speech recognition start failed:', e);
      setIsListening(false);
    }
  };

  const handleStopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  // Direct one-click fallback for students who cannot speak or have mic permission blocks
  const handleDirectGreeting = () => {
    triggerSuccess('안녕하세요!');
  };

  const triggerSuccess = (greeting: string) => {
    if (isSuccess) return;
    setIsSuccess(true);
    setIsListening(false);

    const friendlyReplies = [
      `어서오세요! ${student.name} 친구! 밝고 씩씩하게 인사해주어 정말 고마워요! 오늘도 힘찬 하루 보내요! ⭐`,
      `와아, 반갑습니다! 환한 미소로 반갑게 인사해주니 가게가 환해졌어요! 최고예요! ⭐`,
      `안녕하세요! 예쁜 목소리로 인사해주어 마트 점장님이 정말 행복해요! 참 잘했어요! ⭐`,
    ];
    const reply = friendlyReplies[Math.floor(Math.random() * friendlyReplies.length)];
    setManagerReaction(reply);

    playFanfareSound();
    speakKoreanText(reply);

    // Confetti celebration
    confetti({
      particleCount: 110,
      spread: 75,
      origin: { y: 0.6 },
      colors: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'],
    });

    onComplete({
      studentId: student.id,
      studentNickname: student.name,
      studentAnimal: student.animal,
      missionType: 'greeting',
      missionTitle: '마트 인사 미션 (말하기)',
      status: 'completed',
      feedback: reply,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl border-4 border-sky-300 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-400 to-blue-500 px-5 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white text-sky-600 flex items-center justify-center shadow-md">
              <Store className="w-7 h-7" />
            </div>
            <div>
              <h3
                className="text-xl sm:text-2xl font-black flex items-center gap-1.5"
                style={{ fontFamily: "'Jua', sans-serif" }}
              >
                <span>마트 인사 미션</span>
                <span>🏪</span>
              </h3>
              <p className="text-xs sm:text-sm text-sky-100 font-medium">
                친절한 점장님께 씩씩하게 "안녕하세요!" 인사해요
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-11 h-11 rounded-2xl bg-black/15 hover:bg-black/25 flex items-center justify-center text-white transition-all cursor-pointer active:scale-95"
            title="닫기"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5 text-center">
          {/* Animated Friendly Store Manager Card */}
          <div className="bg-gradient-to-b from-sky-50 to-blue-50 rounded-3xl p-5 border-2 border-sky-200 relative overflow-hidden flex flex-col items-center">
            {/* Manager Avatar with responsive animation */}
            <div
              className={`w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-amber-100 border-4 border-sky-300 flex items-center justify-center shadow-md text-6xl sm:text-7xl transition-transform duration-500 ${
                isSuccess ? 'animate-bounce scale-110' : isListening ? 'scale-105' : 'hover:scale-105'
              }`}
            >
              🧑‍💼
            </div>

            <div className="mt-3">
              <h4
                className="text-lg sm:text-xl font-extrabold text-sky-950 flex items-center justify-center gap-1.5"
                style={{ fontFamily: "'Jua', sans-serif" }}
              >
                <span>친절한 점장님</span>
                <Smile className="w-5 h-5 text-amber-500" />
              </h4>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                "손님이 오시면 눈을 맞추고 반갑게 인사해요!"
              </p>
            </div>

            {/* Spoken Speech Bubble */}
            <div className="mt-4 w-full max-w-sm bg-white rounded-2xl p-3 sm:p-4 border-2 border-sky-300 shadow-sm relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-t-2 border-l-2 border-sky-300 rotate-45" />
              <p className="text-xs text-slate-400 font-bold mb-1">인사할 말:</p>
              <p
                className="text-xl sm:text-2xl font-black text-sky-900"
                style={{ fontFamily: "'Jua', sans-serif" }}
              >
                "안녕하세요! 점장님!"
              </p>
            </div>
          </div>

          {/* Manager's Warm Response if successful */}
          {managerReaction ? (
            <div className="bg-emerald-50 rounded-2xl p-4 sm:p-5 border-2 border-emerald-300 shadow-sm space-y-3 animate-fade-in text-left">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-base sm:text-lg">
                  <span className="text-2xl">⭐</span>
                  <span style={{ fontFamily: "'Jua', sans-serif" }}>점장님의 반가운 화답</span>
                </div>
                <button
                  type="button"
                  onClick={() => speakKoreanText(managerReaction)}
                  className="h-10 px-3 rounded-xl bg-emerald-200/80 hover:bg-emerald-300 text-emerald-900 flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer active:scale-95"
                  title="다시 듣기"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>다시 듣기</span>
                </button>
              </div>

              <div className="bg-white p-4 rounded-xl border border-emerald-200">
                <p
                  className="text-lg sm:text-xl font-bold text-emerald-950 leading-relaxed"
                  style={{ fontFamily: "'Jua', sans-serif" }}
                >
                  {managerReaction}
                </p>
              </div>
            </div>
          ) : (
            /* Microphone Touch Area */
            <div className="space-y-4">
              <div className="flex flex-col items-center justify-center">
                <button
                  type="button"
                  onClick={isListening ? handleStopListening : handleStartListening}
                  className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full flex flex-col items-center justify-center shadow-xl transition-all duration-300 cursor-pointer active:scale-90 ${
                    isListening
                      ? 'bg-rose-500 text-white animate-pulse ring-8 ring-rose-200'
                      : 'bg-sky-500 hover:bg-sky-600 text-white ring-8 ring-sky-100 hover:ring-sky-200'
                  }`}
                  title={isListening ? '듣고 있어요! 말씀해주세요' : '마이크를 누르고 인사해보세요'}
                >
                  {isListening ? (
                    <>
                      <MicOff className="w-10 h-10 sm:w-12 sm:h-12" />
                      <span className="text-xs font-black mt-1">듣는 중...</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-10 h-10 sm:w-12 sm:h-12" />
                      <span className="text-xs font-black mt-1">마이크 누르기</span>
                    </>
                  )}
                </button>

                <p className="text-xs sm:text-sm text-slate-500 font-bold mt-3">
                  {isListening
                    ? '🎤 지금 "안녕하세요!" 하고 말씀해보세요!'
                    : '위 마이크 버튼을 콕 누르고 "안녕하세요!" 인사해요'}
                </p>

                {spokenText && (
                  <p className="text-sm font-extrabold text-sky-800 bg-sky-50 px-4 py-2 rounded-xl mt-2 border border-sky-200">
                    인식된 소리: "{spokenText}"
                  </p>
                )}
              </div>

              {/* Zero-barrier one-click greeting button */}
              <div className="pt-2 border-t border-slate-100">
                <p className="text-xs text-slate-400 font-medium mb-2">
                  마이크가 없거나 말씀하기 어려울 땐 아래 버튼을 콕 눌러주세요!
                </p>
                <button
                  type="button"
                  onClick={handleDirectGreeting}
                  className="w-full h-15 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-950 font-extrabold text-base flex items-center justify-center gap-2 transition-colors cursor-pointer border border-amber-300 shadow-xs"
                >
                  <MessageCircle className="w-5 h-5 text-amber-700" />
                  <span>"안녕하세요! 점장님!" 인사 건네기 🗣️</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Controls */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200">
          {isSuccess ? (
            <button
              type="button"
              onClick={onClose}
              className="w-full h-16 sm:h-18 rounded-2xl sm:rounded-3xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xl sm:text-2xl shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
              style={{ fontFamily: "'Jua', sans-serif" }}
            >
              <Check className="w-7 h-7 stroke-[3]" />
              <span>우와! 미션 완료! 별 받기 ⭐</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="w-full h-14 rounded-2xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-extrabold text-base flex items-center justify-center transition-all cursor-pointer"
            >
              다음에 할래요
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
