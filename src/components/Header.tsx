import React from 'react';
import { Sparkles, GraduationCap, User, Database, Volume2 } from 'lucide-react';
import { AppViewMode } from '../types';
import { playChimeSound, speakKoreanText } from '../services/soundEffects';

interface HeaderProps {
  currentMode: AppViewMode;
  onModeChange: (mode: AppViewMode) => void;
  isFirebaseConnected: boolean;
  onOpenInfoModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentMode,
  onModeChange,
  isFirebaseConnected,
  onOpenInfoModal,
}) => {
  const handleSoundTest = () => {
    playChimeSound();
    speakKoreanText('반짝반짝 직업 탐험대에 오신 것을 환영해요!');
  };

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-amber-100 shadow-sm sticky top-0 z-30 px-4 py-3 sm:px-8">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Brand Logo */}
        <div
          onClick={handleSoundTest}
          className="flex items-center gap-3 cursor-pointer group select-none"
          title="클릭하면 환영 소리가 나요!"
        >
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center shadow-md shadow-amber-200 group-hover:scale-105 transition-transform duration-300">
            <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 text-white fill-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl sm:text-2xl font-extrabold text-amber-950 tracking-tight" style={{ fontFamily: "'Jua', sans-serif" }}>
                반짝반짝 직업 탐험대
              </span>
              <span className="text-xl">⭐</span>
            </div>
            <p className="text-xs sm:text-sm text-amber-700 font-medium hidden sm:block">
              특수교육 맞춤형 활동 중심 진로·직업 체험
            </p>
          </div>
        </div>

        {/* Action Controls & Navigation */}
        <div className="flex items-center flex-wrap justify-center gap-2 sm:gap-3">
          {/* Sound Helper Button */}
          <button
            type="button"
            onClick={handleSoundTest}
            className="h-11 px-3.5 rounded-2xl bg-amber-100/70 hover:bg-amber-200/80 text-amber-900 flex items-center gap-1.5 text-xs sm:text-sm font-bold transition-all active:scale-95 cursor-pointer"
            title="음성 및 소리 테스트"
          >
            <Volume2 className="w-4 h-4 text-amber-700" />
            <span>소리 켜기</span>
          </button>

          {/* Firebase Connection Status Badge */}
          <button
            type="button"
            onClick={onOpenInfoModal}
            className={`h-11 px-3.5 rounded-2xl border flex items-center gap-1.5 text-xs sm:text-sm font-semibold transition-all active:scale-95 cursor-pointer ${
              isFirebaseConnected
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100'
                : 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100'
            }`}
            title="클릭하여 데이터베이스 및 연동 안내 확인"
          >
            <Database className="w-4 h-4" />
            <span className="flex items-center gap-1">
              <span
                className={`w-2 h-2 rounded-full ${
                  isFirebaseConnected ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'
                }`}
              />
              {isFirebaseConnected ? 'Firebase 연결됨' : '실시간 모의 모드'}
            </span>
          </button>

          {/* Mode Switcher Toggle */}
          <div className="bg-slate-100 p-1 rounded-2xl flex items-center border border-slate-200 shadow-inner">
            <button
              type="button"
              onClick={() => onModeChange('student')}
              className={`flex items-center gap-1.5 px-4 h-9 sm:h-10 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                currentMode === 'student'
                  ? 'bg-amber-500 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-4 h-4" />
              <span>학생 모드</span>
            </button>
            <button
              type="button"
              onClick={() => onModeChange('teacher')}
              className={`flex items-center gap-1.5 px-4 h-9 sm:h-10 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                currentMode === 'teacher'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>교사 대시보드</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
