import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Award,
  Users,
  CheckCircle2,
  Trash2,
  PlusCircle,
  Clock,
  ExternalLink,
  ShieldCheck,
  Lock,
  LogOut,
  RefreshCw,
  Coffee,
  Store,
  Eye,
  X,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { MissionRecord } from '../types';
import { STUDENT_CHARACTERS } from '../data/characters';
import {
  subscribeToMissions,
  sendBroadcast,
  resetMissions,
  addMissionRecord,
  isFirebaseConfigured,
} from '../services/firebase';
import { playFanfareSound, speakKoreanText } from '../services/soundEffects';

export const TeacherDashboard: React.FC = () => {
  // PIN lock state (Default: 1234)
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  // Real-time data
  const [missions, setMissions] = useState<MissionRecord[]>([]);
  const [praiseLoading, setPraiseLoading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'byStudent'>('byStudent');

  // Real-time Firestore or Local Broadcast listener
  useEffect(() => {
    const unsubscribe = subscribeToMissions((updatedMissions) => {
      setMissions(updatedMissions);
    });
    return () => unsubscribe();
  }, []);

  const handlePinSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (pinInput.trim() === '1234') {
      setIsAuthenticated(true);
      setPinError(false);
      setPinInput('');
    } else {
      setPinError(true);
    }
  };

  // One-click Broadcast Praise to all students
  const handlePraiseAll = async () => {
    setPraiseLoading(true);
    playFanfareSound();

    // Trigger local teacher confetti
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.5 },
      colors: ['#6366f1', '#ec4899', '#f59e0b', '#10b981'],
    });

    await sendBroadcast('선생님의 특급 칭찬이 도착했어요! 여러분 모두 참 잘했어요! ⭐');
    speakKoreanText('학생들에게 축하 폭죽과 칭찬 메시지를 보냈어요!');

    setTimeout(() => {
      setPraiseLoading(false);
    }, 1200);
  };

  // Add dummy test mission for instant demonstration
  const handleAddSampleMission = async () => {
    const randomStudent =
      STUDENT_CHARACTERS[Math.floor(Math.random() * STUDENT_CHARACTERS.length)];
    const isBarista = Math.random() > 0.5;

    await addMissionRecord({
      studentId: randomStudent.id,
      studentNickname: randomStudent.name,
      studentAnimal: randomStudent.animal,
      missionType: isBarista ? 'barista' : 'greeting',
      missionTitle: isBarista ? '바리스타 미션 (사진 찍기)' : '마트 인사 미션 (말하기)',
      status: 'completed',
      feedback: isBarista
        ? '우와! 컵과 냅킨을 정말 정성껏 정리했어요! 최고예요! ⭐'
        : '환한 미소로 씩씩하게 인사해주어 점장님이 정말 기뻐했어요! ⭐',
    });
  };

  const handleClearAll = async () => {
    if (window.confirm('오늘의 미션 완료 기록을 모두 초기화하고 새로 시작할까요?')) {
      await resetMissions();
      speakKoreanText('새 수업을 위해 기록을 초기화했습니다.');
    }
  };

  // If not authenticated, show friendly PIN keypad
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white rounded-3xl p-6 sm:p-8 border-2 border-indigo-200 shadow-xl text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-indigo-100 text-indigo-700 flex items-center justify-center mx-auto shadow-sm">
          <Lock className="w-8 h-8" />
        </div>

        <div>
          <h2
            className="text-2xl font-black text-slate-800"
            style={{ fontFamily: "'Jua', sans-serif" }}
          >
            교사 대시보드 입장
          </h2>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            학생들의 미션 현황을 실시간으로 확인하기 위해 비밀번호(PIN)를 입력해주세요.
          </p>
          <p className="text-xs text-indigo-600 font-bold mt-1 bg-indigo-50 py-1 px-3 rounded-full inline-block">
            기본 비밀번호: 1234
          </p>
        </div>

        <form onSubmit={handlePinSubmit} className="space-y-4">
          <input
            type="password"
            maxLength={4}
            value={pinInput}
            onChange={(e) => {
              setPinInput(e.target.value);
              setPinError(false);
            }}
            placeholder="숫자 4자리 (1234)"
            className="w-full h-16 text-center text-3xl font-black tracking-widest border-2 border-slate-300 rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all"
            autoFocus
          />

          {pinError && (
            <p className="text-sm font-bold text-rose-500">
              비밀번호가 맞지 않아요! 기본 비밀번호는 1234 입니다.
            </p>
          )}

          <button
            type="submit"
            className="w-full h-16 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-lg shadow-lg shadow-indigo-200 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-6 h-6" />
            <span>대시보드 열기</span>
          </button>
        </form>

        <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-100">
          {['1', '2', '3', '4'].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => {
                const next = pinInput + num;
                setPinInput(next);
                if (next === '1234') {
                  setIsAuthenticated(true);
                  setPinInput('');
                }
              }}
              className="h-12 bg-slate-100 hover:bg-indigo-50 text-slate-700 font-bold rounded-xl active:scale-95"
            >
              {num}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Calculate statistics
  const totalCompleted = missions.length;
  const uniqueStudents = new Set(missions.map((m) => m.studentId)).size;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner & Praise Broadcast */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="bg-indigo-500/40 text-indigo-200 text-xs font-extrabold px-3 py-1 rounded-full border border-indigo-400/30">
                실시간 수업 모니터링
              </span>
              <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                {isFirebaseConfigured ? 'Firestore 실시간 연결됨' : '로컬 실시간 모드 (모의 연동)'}
              </span>
            </div>
            <h2
              className="text-2xl sm:text-3xl font-black tracking-tight"
              style={{ fontFamily: "'Jua', sans-serif" }}
            >
              특수학급 실시간 직업 미션 현황판 👩‍🏫
            </h2>
            <p className="text-xs sm:text-sm text-indigo-200">
              학생들이 사진을 찍거나 인사를 완료하면 실시간으로 캐릭터 카드에 황금 별이 켜집니다.
            </p>
          </div>

          {/* Action Buttons: Praise All & Logout */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handlePraiseAll}
              disabled={praiseLoading}
              className="h-16 px-6 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-amber-950 font-black text-base sm:text-lg shadow-lg shadow-amber-500/30 flex items-center gap-2.5 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
              style={{ fontFamily: "'Jua', sans-serif" }}
              title="모든 학생의 화면에 축하 폭죽과 칭찬을 보냅니다"
            >
              <Sparkles className="w-6 h-6 text-amber-900 fill-amber-900 animate-spin duration-1000" />
              <span>{praiseLoading ? '칭찬 전송 중...' : '🎉 다 함께 칭찬하기!'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsAuthenticated(false)}
              className="h-16 px-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-sm font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="교사 모드 종료"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden sm:inline">나가기</span>
            </button>
          </div>
        </div>

        {/* Real-time Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-indigo-700/50">
          <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-4 border border-white/10">
            <div className="flex items-center gap-2 text-indigo-200 text-xs sm:text-sm font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>총 완료 미션</span>
            </div>
            <p
              className="text-2xl sm:text-3xl font-black mt-1 text-white"
              style={{ fontFamily: "'Jua', sans-serif" }}
            >
              {totalCompleted}건
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-4 border border-white/10">
            <div className="flex items-center gap-2 text-indigo-200 text-xs sm:text-sm font-semibold">
              <Users className="w-4 h-4 text-amber-400" />
              <span>참여 학생 수</span>
            </div>
            <p
              className="text-2xl sm:text-3xl font-black mt-1 text-white"
              style={{ fontFamily: "'Jua', sans-serif" }}
            >
              {uniqueStudents}명
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-4 border border-white/10">
            <div className="flex items-center gap-2 text-indigo-200 text-xs sm:text-sm font-semibold">
              <Coffee className="w-4 h-4 text-orange-400" />
              <span>바리스타 미션</span>
            </div>
            <p
              className="text-2xl sm:text-3xl font-black mt-1 text-white"
              style={{ fontFamily: "'Jua', sans-serif" }}
            >
              {missions.filter((m) => m.missionType === 'barista').length}건
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-4 border border-white/10">
            <div className="flex items-center gap-2 text-indigo-200 text-xs sm:text-sm font-semibold">
              <Store className="w-4 h-4 text-sky-400" />
              <span>마트 인사 미션</span>
            </div>
            <p
              className="text-2xl sm:text-3xl font-black mt-1 text-white"
              style={{ fontFamily: "'Jua', sans-serif" }}
            >
              {missions.filter((m) => m.missionType === 'greeting').length}건
            </p>
          </div>
        </div>
      </div>

      {/* Control Bar: View Filter & Testing Tools */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('byStudent')}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-colors cursor-pointer ${
              activeTab === 'byStudent'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            학생 캐릭터별 별 현황
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-colors cursor-pointer ${
              activeTab === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            전체 실시간 완료 피드
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAddSampleMission}
            className="px-3.5 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="실시간 스냅샷 확인용 테스트 미션을 추가합니다"
          >
            <PlusCircle className="w-4 h-4 text-amber-600" />
            <span>테스트 미션 추가</span>
          </button>
          <button
            type="button"
            onClick={handleClearAll}
            className="px-3.5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="모든 미션 기록을 비우고 새 수업을 시작합니다"
          >
            <Trash2 className="w-4 h-4 text-rose-600" />
            <span>기록 초기화</span>
          </button>
        </div>
      </div>

      {/* View 1: Students Grid with Live Star Cards */}
      {activeTab === 'byStudent' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {STUDENT_CHARACTERS.map((char) => {
            const studentMissions = missions.filter((m) => m.studentId === char.id);
            const starsCount = studentMissions.length;
            const latestMission = studentMissions[0];

            return (
              <div
                key={char.id}
                className={`bg-white rounded-3xl p-5 border-2 transition-all duration-300 shadow-sm relative overflow-hidden flex flex-col justify-between ${
                  starsCount > 0 ? 'border-amber-300 shadow-amber-100' : 'border-slate-200'
                }`}
              >
                <div>
                  {/* Top Character Info */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-sm ${char.avatarBg}`}
                      >
                        {char.animal}
                      </div>
                      <div>
                        <h3
                          className="text-lg font-black text-slate-800 leading-tight"
                          style={{ fontFamily: "'Jua', sans-serif" }}
                        >
                          {char.name}
                        </h3>
                        <span className="text-xs text-slate-400 font-medium">탐험대원</span>
                      </div>
                    </div>

                    {/* Star Count Badge */}
                    <div
                      className={`px-3 py-1.5 rounded-2xl flex items-center gap-1 text-sm font-black border ${
                        starsCount > 0
                          ? 'bg-amber-100 border-amber-300 text-amber-900'
                          : 'bg-slate-100 border-slate-200 text-slate-400'
                      }`}
                    >
                      <span>⭐</span>
                      <span>{starsCount}개</span>
                    </div>
                  </div>

                  {/* Stars Visual Display */}
                  <div className="bg-slate-50 rounded-2xl p-2.5 mb-3 flex items-center justify-around border border-slate-100">
                    {[0, 1, 2, 3].map((slotIdx) => (
                      <span
                        key={slotIdx}
                        className={`text-xl transition-transform ${
                          slotIdx < starsCount
                            ? 'scale-110 drop-shadow-sm animate-pulse'
                            : 'opacity-25 grayscale'
                        }`}
                        title={slotIdx < starsCount ? '달성 완료' : '미완료'}
                      >
                        ⭐
                      </span>
                    ))}
                  </div>

                  {/* Latest Completed Mission Details */}
                  {latestMission ? (
                    <div className="bg-amber-50/70 rounded-2xl p-3 border border-amber-200 text-xs space-y-1.5">
                      <div className="flex items-center justify-between text-amber-900 font-bold">
                        <span className="flex items-center gap-1">
                          {latestMission.missionType === 'barista' ? '☕ 바리스타' : '🏪 마트 인사'}
                        </span>
                        <span className="text-slate-500 font-normal">
                          {new Date(latestMission.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-slate-700 line-clamp-2 italic font-medium">
                        "{latestMission.feedback}"
                      </p>

                      {latestMission.photoUrl && (
                        <div className="mt-2 pt-2 border-t border-amber-200/60 flex items-center justify-between">
                          <span className="text-amber-800 font-bold">촬영 사진:</span>
                          <button
                            type="button"
                            onClick={() => setSelectedPhoto(latestMission.photoUrl!)}
                            className="text-indigo-600 hover:text-indigo-800 font-extrabold flex items-center gap-1 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>사진 보기</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="py-4 text-center text-xs text-slate-400 font-medium">
                      아직 진행 중인 미션이 없어요
                    </div>
                  )}
                </div>

                {/* Individual Praise Button */}
                <button
                  type="button"
                  onClick={async () => {
                    playFanfareSound();
                    await sendBroadcast(
                      `선생님이 ${char.name} 친구에게 특별한 칭찬 별을 보냈어요! 최고예요! ⭐`
                    );
                    speakKoreanText(`${char.name} 친구에게 칭찬을 보냈어요!`);
                  }}
                  className="mt-3 w-full h-11 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  <span>{char.name} 칭찬하기</span>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* View 2: Chronological Feed of All Completed Missions */}
      {activeTab === 'all' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h3
            className="text-xl font-black text-slate-800 flex items-center gap-2"
            style={{ fontFamily: "'Jua', sans-serif" }}
          >
            <span>실시간 미션 완료 기록</span>
            <span className="text-sm bg-indigo-100 text-indigo-800 font-bold px-3 py-0.5 rounded-full">
              총 {missions.length}건
            </span>
          </h3>

          {missions.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <Clock className="w-12 h-12 mx-auto text-slate-300" />
              <p className="text-base font-bold">아직 완료된 미션이 없습니다.</p>
              <p className="text-xs">학생들이 미션을 달성하면 여기에 실시간으로 기록됩니다.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {missions.map((record) => (
                <div
                  key={record.id}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 px-2 rounded-2xl transition-colors"
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-100 text-2xl flex items-center justify-center shrink-0 shadow-2xs">
                      {record.studentAnimal || '⭐'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className="font-extrabold text-base text-slate-900"
                          style={{ fontFamily: "'Jua', sans-serif" }}
                        >
                          {record.studentNickname}
                        </span>
                        <span
                          className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                            record.missionType === 'barista'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-sky-100 text-sky-800'
                          }`}
                        >
                          {record.missionTitle}
                        </span>
                        <span className="text-xs text-slate-400">
                          {new Date(record.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 mt-1 font-medium italic">
                        "{record.feedback}"
                      </p>
                    </div>
                  </div>

                  {record.photoUrl && (
                    <button
                      type="button"
                      onClick={() => setSelectedPhoto(record.photoUrl!)}
                      className="shrink-0 h-10 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                    >
                      <Eye className="w-4 h-4 text-indigo-600" />
                      <span>촬영 사진 보기</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Photo Viewer Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 space-y-4 shadow-2xl border-2 border-indigo-200">
            <div className="flex items-center justify-between">
              <h4
                className="text-lg font-black text-slate-800"
                style={{ fontFamily: "'Jua', sans-serif" }}
              >
                학생이 제출한 바리스타 사진 📸
              </h4>
              <button
                type="button"
                onClick={() => setSelectedPhoto(null)}
                className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 aspect-4/3 flex items-center justify-center">
              <img
                src={selectedPhoto}
                alt="학생 제출 사진"
                className="w-full h-full object-contain"
              />
            </div>
            <button
              type="button"
              onClick={() => setSelectedPhoto(null)}
              className="w-full h-13 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-base cursor-pointer"
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
