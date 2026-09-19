import React from 'react';
import { Star, Trophy, Award, Sparkles } from 'lucide-react';
import { playChimeSound, speakKoreanText } from '../services/soundEffects';

interface StampBoardProps {
  completedCount: number;
  totalSlots?: number;
  studentName: string;
}

export const StampBoard: React.FC<StampBoardProps> = ({
  completedCount,
  totalSlots = 4,
  studentName,
}) => {
  const handleBoardClick = () => {
    playChimeSound();
    speakKoreanText(`${studentName} 친구가 모은 별은 총 ${completedCount}개예요! 최고예요!`);
  };

  const slots = Array.from({ length: totalSlots });

  return (
    <div
      onClick={handleBoardClick}
      className="bg-gradient-to-br from-amber-100 via-orange-50 to-amber-100 rounded-3xl p-5 sm:p-7 border-2 border-amber-300 shadow-sm relative overflow-hidden select-none cursor-pointer transition-transform duration-200 active:scale-[0.99]"
      title="클릭하면 별 개수를 소리로 읽어줘요!"
    >
      {/* Decorative background sparkles */}
      <div className="absolute top-2 right-4 text-amber-200/50 pointer-events-none">
        <Sparkles className="w-24 h-24" />
      </div>

      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-white flex items-center justify-center shadow-md">
              <Trophy className="w-7 h-7" />
            </div>
            <div>
              <h3
                className="text-xl sm:text-2xl font-black text-amber-950 flex items-center gap-2"
                style={{ fontFamily: "'Jua', sans-serif" }}
              >
                <span>나의 황금 별 스탬프 판</span>
                <span>⭐</span>
              </h3>
              <p className="text-xs sm:text-sm text-amber-800 font-medium">
                미션을 끝낼 때마다 황금 별이 반짝 켜져요!
              </p>
            </div>
          </div>

          {/* Star Counter Pill */}
          <div className="inline-flex items-center gap-2 bg-white/90 border border-amber-300 px-4 py-2 rounded-2xl shadow-sm self-start sm:self-auto">
            <Award className="w-5 h-5 text-amber-500" />
            <span className="text-sm font-bold text-slate-600">모은 별:</span>
            <span
              className="text-2xl font-black text-amber-600"
              style={{ fontFamily: "'Jua', sans-serif" }}
            >
              {completedCount}개
            </span>
          </div>
        </div>

        {/* Stamps slots */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-2">
          {slots.map((_, index) => {
            const isStamped = index < completedCount;
            return (
              <div
                key={index}
                className={`min-h-[5.5rem] sm:min-h-[6.5rem] rounded-2xl sm:rounded-3xl border-2 sm:border-3 flex flex-col items-center justify-center p-3 transition-all duration-300 relative ${
                  isStamped
                    ? 'bg-amber-400/20 border-amber-400 shadow-md scale-100'
                    : 'bg-white/60 border-dashed border-amber-200/80 scale-95 opacity-70'
                }`}
              >
                <div className="relative">
                  <Star
                    className={`w-10 h-10 sm:w-12 sm:h-12 transition-all duration-500 ${
                      isStamped
                        ? 'text-amber-500 fill-amber-400 drop-shadow-md animate-bounce'
                        : 'text-amber-200 fill-transparent'
                    }`}
                  />
                  {isStamped && (
                    <Sparkles className="w-5 h-5 text-yellow-500 absolute -top-1 -right-2 animate-spin duration-1000" />
                  )}
                </div>
                <span
                  className={`text-xs sm:text-sm mt-1 font-extrabold ${
                    isStamped ? 'text-amber-900' : 'text-slate-400'
                  }`}
                  style={{ fontFamily: "'Jua', sans-serif" }}
                >
                  {isStamped ? `${index + 1}호 별 완료!` : `${index + 1}호 자리`}
                </span>
              </div>
            );
          })}
        </div>

        {/* Cheerful bottom hint */}
        <div className="mt-4 pt-3 border-t border-amber-200/60 text-center sm:text-left flex items-center justify-between">
          <p className="text-xs sm:text-sm text-amber-900 font-bold">
            {completedCount === 0 && '👉 아래 오늘의 직업 미션 카드를 눌러 첫 번째 별을 모아봐요!'}
            {completedCount > 0 && completedCount < totalSlots && `🎉 대단해요! 별을 벌써 ${completedCount}개나 모았어요! 계속 도전해봐요!`}
            {completedCount >= totalSlots && '👑 우와! 황금 별 스탬프 판을 전부 채웠어요! 진정한 직업 마스터!'}
          </p>
          <span className="text-xs bg-amber-200 text-amber-950 font-bold px-2.5 py-1 rounded-full hidden sm:inline-block">
            소리 안내 지원 📢
          </span>
        </div>
      </div>
    </div>
  );
};
