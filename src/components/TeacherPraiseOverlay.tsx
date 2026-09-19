import React, { useEffect } from 'react';
import { Sparkles, Award, Heart, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playFanfareSound, speakKoreanText } from '../services/soundEffects';

interface TeacherPraiseOverlayProps {
  message: string | null;
  onClose: () => void;
}

export const TeacherPraiseOverlay: React.FC<TeacherPraiseOverlayProps> = ({
  message,
  onClose,
}) => {
  useEffect(() => {
    if (message) {
      playFanfareSound();
      speakKoreanText(message);

      // Multi-burst confetti celebration
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.4 },
        colors: ['#f59e0b', '#ec4899', '#3b82f6', '#10b981'],
      });

      const timer = setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 90,
          origin: { y: 0.5 },
        });
      }, 400);

      return () => clearTimeout(timer);
    }
  }, [message]);

  if (!message) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="bg-gradient-to-br from-amber-300 via-yellow-200 to-amber-400 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center border-4 border-white shadow-2xl space-y-5 animate-scale-up">
        {/* Animated Trophy / Medal Icon */}
        <div className="relative inline-block">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-white text-amber-500 flex items-center justify-center mx-auto shadow-xl">
            <Award className="w-16 h-16 sm:w-18 sm:h-18 fill-amber-400 text-amber-500 animate-bounce" />
          </div>
          <Sparkles className="w-8 h-8 text-yellow-600 absolute -top-2 -right-2 animate-spin duration-1000" />
          <Heart className="w-6 h-6 text-rose-500 fill-rose-500 absolute -bottom-1 -left-1 animate-pulse" />
        </div>

        <div>
          <span className="bg-amber-600 text-white text-xs sm:text-sm font-extrabold px-3.5 py-1 rounded-full uppercase tracking-wider">
            선생님의 특급 칭찬 💌
          </span>
          <h3
            className="text-2xl sm:text-3xl font-black text-amber-950 mt-2"
            style={{ fontFamily: "'Jua', sans-serif" }}
          >
            참 잘했어요! ⭐
          </h3>
        </div>

        <div className="bg-white/90 p-4 rounded-2xl border-2 border-amber-300 shadow-sm">
          <p
            className="text-lg sm:text-xl font-bold text-slate-800 leading-snug"
            style={{ fontFamily: "'Jua', sans-serif" }}
          >
            {message}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full h-16 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xl shadow-lg shadow-amber-700/30 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
          style={{ fontFamily: "'Jua', sans-serif" }}
        >
          <Check className="w-7 h-7 stroke-[3]" />
          <span>신나요! 확인했어요! 👏</span>
        </button>
      </div>
    </div>
  );
};
