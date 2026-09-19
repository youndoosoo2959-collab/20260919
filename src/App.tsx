import React, { useState, useEffect } from 'react';
import { Coffee, Store, Sparkles, Check, ArrowRight, Award, Volume2 } from 'lucide-react';
import { Header } from './components/Header';
import { StudentSelector } from './components/StudentSelector';
import { StampBoard } from './components/StampBoard';
import { BaristaMissionModal } from './components/BaristaMissionModal';
import { GreetingMissionModal } from './components/GreetingMissionModal';
import { TeacherDashboard } from './components/TeacherDashboard';
import { FirebaseModal } from './components/FirebaseModal';
import { TeacherPraiseOverlay } from './components/TeacherPraiseOverlay';
import { StarStampOverlay } from './components/StarStampOverlay';

import { STUDENT_CHARACTERS } from './data/characters';
import { AppViewMode, StudentProfile, MissionRecord } from './types';
import {
  subscribeToMissions,
  subscribeToBroadcasts,
  addMissionRecord,
  isFirebaseConfigured,
} from './services/firebase';
import { playChimeSound, speakKoreanText } from './services/soundEffects';

export default function App() {
  const [currentMode, setCurrentMode] = useState<AppViewMode>('student');
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile>(STUDENT_CHARACTERS[0]);
  const [missions, setMissions] = useState<MissionRecord[]>([]);

  // Modals state
  const [isBaristaModalOpen, setIsBaristaModalOpen] = useState(false);
  const [isGreetingModalOpen, setIsGreetingModalOpen] = useState(false);
  const [isFirebaseModalOpen, setIsFirebaseModalOpen] = useState(false);

  // Celebratory Overlays state
  const [teacherPraiseMessage, setTeacherPraiseMessage] = useState<string | null>(null);
  const [starStampData, setStarStampData] = useState<{
    isOpen: boolean;
    missionTitle: string;
  }>({
    isOpen: false,
    missionTitle: '',
  });

  // Subscribe to real-time missions
  useEffect(() => {
    const unsubscribe = subscribeToMissions((updated) => {
      setMissions(updated);
    });
    return () => unsubscribe();
  }, []);

  // Subscribe to teacher broadcast praise
  useEffect(() => {
    const unsubscribe = subscribeToBroadcasts((msg) => {
      if (msg.type === 'praise_all') {
        setTeacherPraiseMessage(msg.message);
      }
    });
    return () => unsubscribe();
  }, []);

  // Completed missions for current active student
  const studentCompletedMissions = missions.filter(
    (m) => m.studentId === selectedStudent.id
  );
  const baristaCompleted = studentCompletedMissions.find((m) => m.missionType === 'barista');
  const greetingCompleted = studentCompletedMissions.find((m) => m.missionType === 'greeting');

  // Handle mission completion from modal
  const handleMissionCompleted = async (
    recordData: Omit<MissionRecord, 'id' | 'timestamp'>
  ) => {
    await addMissionRecord(recordData);
    setStarStampData({
      isOpen: true,
      missionTitle: recordData.missionTitle,
    });
  };

  return (
    <div className="min-h-screen bg-amber-50/50 flex flex-col selection:bg-amber-200">
      {/* Top Header */}
      <Header
        currentMode={currentMode}
        onModeChange={setCurrentMode}
        isFirebaseConnected={isFirebaseConfigured}
        onOpenInfoModal={() => setIsFirebaseModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-5 sm:py-8 sm:px-6 space-y-6">
        {currentMode === 'teacher' ? (
          /* Teacher Dashboard View */
          <TeacherDashboard />
        ) : (
          /* Student View */
          <div className="space-y-6 animate-fade-in">
            {/* 1. Character Nickname Selector (Privacy-safe) */}
            <StudentSelector
              selectedStudent={selectedStudent}
              onSelectStudent={setSelectedStudent}
            />

            {/* 2. Golden Star Stamp Board */}
            <StampBoard
              completedCount={studentCompletedMissions.length}
              totalSlots={4}
              studentName={selectedStudent.name}
            />

            {/* 3. Today's 2 Core Missions */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2
                    className="text-xl sm:text-2xl font-black text-amber-950 flex items-center gap-2"
                    style={{ fontFamily: "'Jua', sans-serif" }}
                  >
                    <span>오늘의 직업 탐험 미션</span>
                    <span>🎒</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium">
                    카드를 누르면 친절한 목소리로 미션을 안내해줘요!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    playChimeSound();
                    speakKoreanText(
                      '오늘의 미션은 바리스타 사진 미션과 마트 인사 미션이에요! 카드를 눌러 시작해보세요!'
                    );
                  }}
                  className="h-10 px-3.5 rounded-xl bg-amber-100/80 hover:bg-amber-200 text-amber-900 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Volume2 className="w-4 h-4 text-amber-700" />
                  <span>미션 설명 듣기</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                {/* Mission 1: Barista Photo Mission */}
                <div
                  className={`bg-white rounded-3xl p-6 sm:p-7 border-3 transition-all duration-300 shadow-sm flex flex-col justify-between relative overflow-hidden ${
                    baristaCompleted
                      ? 'border-emerald-400 bg-emerald-50/20'
                      : 'border-amber-200 hover:border-amber-400 hover:shadow-md'
                  }`}
                >
                  {baristaCompleted && (
                    <div className="absolute -top-1 -right-1 bg-emerald-500 text-white text-xs font-black px-4 py-1.5 rounded-bl-2xl shadow-sm flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>별 획득 완료 ⭐</span>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-3xl bg-amber-100 text-amber-800 flex items-center justify-center text-4xl sm:text-5xl shadow-sm shrink-0">
                        ☕
                      </div>
                      <div>
                        <span className="bg-amber-100 text-amber-900 text-xs font-extrabold px-3 py-1 rounded-full">
                          첫 번째 미션
                        </span>
                        <h3
                          className="text-2xl sm:text-3xl font-black text-amber-950 mt-1"
                          style={{ fontFamily: "'Jua', sans-serif" }}
                        >
                          바리스타 미션
                        </h3>
                        <p className="text-sm text-slate-500 font-bold">사진 찍기 📸</p>
                      </div>
                    </div>

                    <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200/80 space-y-2">
                      <p className="text-sm font-bold text-amber-950 flex items-center gap-1.5">
                        <span>미션 내용:</span>
                        <span className="text-slate-600 font-normal">
                          컵과 빨대, 냅킨을 준비하고 찰칵!
                        </span>
                      </p>
                      <div className="flex items-center gap-2 text-xs font-bold text-amber-800">
                        <span className="bg-white px-2 py-1 rounded-lg border border-amber-200">
                          🥤 컵
                        </span>
                        <span className="bg-white px-2 py-1 rounded-lg border border-amber-200">
                          🥢 빨대
                        </span>
                        <span className="bg-white px-2 py-1 rounded-lg border border-amber-200">
                          🧻 냅킨
                        </span>
                      </div>
                    </div>

                    {baristaCompleted && (
                      <div className="bg-emerald-50 rounded-2xl p-3.5 border border-emerald-200 text-xs text-emerald-900 space-y-1">
                        <p className="font-extrabold flex items-center gap-1">
                          <span>선생님 칭찬:</span>
                          <span className="text-emerald-600">⭐ 완료</span>
                        </p>
                        <p className="font-medium italic">"{baristaCompleted.feedback}"</p>
                      </div>
                    )}
                  </div>

                  {/* Big Touch Action Button (min h-16) */}
                  <button
                    type="button"
                    onClick={() => setIsBaristaModalOpen(true)}
                    className={`mt-6 w-full h-16 sm:h-18 rounded-2xl sm:rounded-3xl font-black text-lg sm:text-xl flex items-center justify-center gap-2.5 transition-all shadow-md active:scale-95 cursor-pointer ${
                      baristaCompleted
                        ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-200'
                        : 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-200'
                    }`}
                    style={{ fontFamily: "'Jua', sans-serif" }}
                  >
                    <Coffee className="w-6 h-6" />
                    <span>
                      {baristaCompleted ? '다시 사진 찍어보기 📸' : '카메라 켜고 사진 찍기! 📸'}
                    </span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>

                {/* Mission 2: Mart Greeting Voice Mission */}
                <div
                  className={`bg-white rounded-3xl p-6 sm:p-7 border-3 transition-all duration-300 shadow-sm flex flex-col justify-between relative overflow-hidden ${
                    greetingCompleted
                      ? 'border-emerald-400 bg-emerald-50/20'
                      : 'border-sky-200 hover:border-sky-400 hover:shadow-md'
                  }`}
                >
                  {greetingCompleted && (
                    <div className="absolute -top-1 -right-1 bg-emerald-500 text-white text-xs font-black px-4 py-1.5 rounded-bl-2xl shadow-sm flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>별 획득 완료 ⭐</span>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-3xl bg-sky-100 text-sky-800 flex items-center justify-center text-4xl sm:text-5xl shadow-sm shrink-0">
                        🏪
                      </div>
                      <div>
                        <span className="bg-sky-100 text-sky-900 text-xs font-extrabold px-3 py-1 rounded-full">
                          두 번째 미션
                        </span>
                        <h3
                          className="text-2xl sm:text-3xl font-black text-sky-950 mt-1"
                          style={{ fontFamily: "'Jua', sans-serif" }}
                        >
                          마트 인사 미션
                        </h3>
                        <p className="text-sm text-slate-500 font-bold">목소리로 인사하기 🎤</p>
                      </div>
                    </div>

                    <div className="bg-sky-50 rounded-2xl p-4 border border-sky-200/80 space-y-2">
                      <p className="text-sm font-bold text-sky-950 flex items-center gap-1.5">
                        <span>미션 내용:</span>
                        <span className="text-slate-600 font-normal">
                          친절한 점장님께 "안녕하세요!" 인사해요
                        </span>
                      </p>
                      <div className="flex items-center gap-2 text-xs font-bold text-sky-800">
                        <span className="bg-white px-3 py-1.5 rounded-xl border border-sky-200 text-sm">
                          🗣️ "안녕하세요! 점장님!"
                        </span>
                      </div>
                    </div>

                    {greetingCompleted && (
                      <div className="bg-emerald-50 rounded-2xl p-3.5 border border-emerald-200 text-xs text-emerald-900 space-y-1">
                        <p className="font-extrabold flex items-center gap-1">
                          <span>점장님 화답:</span>
                          <span className="text-emerald-600">⭐ 완료</span>
                        </p>
                        <p className="font-medium italic">"{greetingCompleted.feedback}"</p>
                      </div>
                    )}
                  </div>

                  {/* Big Touch Action Button (min h-16) */}
                  <button
                    type="button"
                    onClick={() => setIsGreetingModalOpen(true)}
                    className={`mt-6 w-full h-16 sm:h-18 rounded-2xl sm:rounded-3xl font-black text-lg sm:text-xl flex items-center justify-center gap-2.5 transition-all shadow-md active:scale-95 cursor-pointer ${
                      greetingCompleted
                        ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-200'
                        : 'bg-sky-500 hover:bg-sky-600 text-white shadow-sky-200'
                    }`}
                    style={{ fontFamily: "'Jua', sans-serif" }}
                  >
                    <Store className="w-6 h-6" />
                    <span>
                      {greetingCompleted ? '다시 인사해보기 🎤' : '마이크 켜고 인사하기! 🎤'}
                    </span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white/80 border-t border-amber-100 py-4 px-4 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="font-medium">
            반짝반짝 직업 탐험대 · 특수교육(기본교육과정) 고등학생 맞춤형 진로·직업 체험 플랫폼
          </p>
          <div className="flex items-center gap-3 font-semibold">
            <button
              type="button"
              onClick={() => setIsFirebaseModalOpen(true)}
              className="text-amber-800 hover:underline cursor-pointer"
            >
              연동 안내 및 보안 규칙
            </button>
            <span>·</span>
            <span>Gemini Multimodal AI Powered</span>
          </div>
        </div>
      </footer>

      {/* Mission Modals */}
      <BaristaMissionModal
        isOpen={isBaristaModalOpen}
        onClose={() => setIsBaristaModalOpen(false)}
        student={selectedStudent}
        onComplete={handleMissionCompleted}
      />

      <GreetingMissionModal
        isOpen={isGreetingModalOpen}
        onClose={() => setIsGreetingModalOpen(false)}
        student={selectedStudent}
        onComplete={handleMissionCompleted}
      />

      {/* Info & Setup Modal */}
      <FirebaseModal
        isOpen={isFirebaseModalOpen}
        onClose={() => setIsFirebaseModalOpen(false)}
      />

      {/* Celebration Overlays */}
      <TeacherPraiseOverlay
        message={teacherPraiseMessage}
        onClose={() => setTeacherPraiseMessage(null)}
      />

      <StarStampOverlay
        isOpen={starStampData.isOpen}
        onClose={() => setStarStampData({ isOpen: false, missionTitle: '' })}
        missionTitle={starStampData.missionTitle}
        studentName={selectedStudent.name}
      />
    </div>
  );
}
