import React from 'react';
import { Star, Sparkles, Check } from 'lucide-react';

interface StarStampOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  missionTitle: string;
  studentName: string;
}

export const StarStampOverlay: React.FC<StarStampOverlayProps> = ({
  isOpen,
  onClose,
  missionTitle,
  studentName,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="bg-gradient-to-br from-amber-400 via-yellow-300 to-amber-500 rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center border-4 border-white shadow-2xl space-y-4 animate-scale-up">
        <div className="relative inline-block my-2">
          <div className="w-28 h-28 rounded-full bg-white text-amber-500 flex items-center justify-center mx-auto shadow-2xl ring-8 ring-amber-200/80">
            <Star className="w-20 h-20 fill-amber-400 text-amber-500 animate-bounce" />
          </div>
          <Sparkles className="w-10 h-10 text-yellow-100 absolute -top-3 -right-3 animate-spin duration-1000" />
        </div>

        <div>
          <span className="bg-amber-700 text-white text-xs font-black px-3 py-1 rounded-full uppercase">
            황금 별 스탬프 획득! ⭐
          </span>
          <h3
            className="text-2xl sm:text-3xl font-black text-amber-950 mt-2"
            style={{ fontFamily: "'Jua', sans-serif" }}
          >
            {studentName} 최고예요!
          </h3>
          <p className="text-sm font-bold text-amber-900 mt-1">
            [{missionTitle}] 미션 성공!
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full h-16 rounded-2xl bg-amber-800 hover:bg-amber-900 text-white font-black text-xl shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
          style={{ fontFamily: "'Jua', sans-serif" }}
        >
          <Check className="w-6 h-6 stroke-[3]" />
          <span>스탬프 판에 별 붙이기 ⭐</span>
        </button>
      </div>
    </div>
  );
};
