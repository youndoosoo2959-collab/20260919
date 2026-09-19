import React from 'react';
import { STUDENT_CHARACTERS } from '../data/characters';
import { StudentProfile } from '../types';
import { playPopSound, speakKoreanText } from '../services/soundEffects';
import { Check } from 'lucide-react';

interface StudentSelectorProps {
  selectedStudent: StudentProfile;
  onSelectStudent: (student: StudentProfile) => void;
}

export const StudentSelector: React.FC<StudentSelectorProps> = ({
  selectedStudent,
  onSelectStudent,
}) => {
  const handleSelect = (character: StudentProfile) => {
    playPopSound();
    onSelectStudent(character);
    speakKoreanText(`안녕! ${character.name}!`);
  };

  return (
    <section className="bg-white rounded-3xl p-5 sm:p-7 shadow-sm border border-amber-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h2
            className="text-xl sm:text-2xl font-extrabold text-amber-950 flex items-center gap-2"
            style={{ fontFamily: "'Jua', sans-serif" }}
          >
            <span>내 캐릭터를 골라봐요!</span>
            <span className="text-xl">👇</span>
          </h2>
          <p className="text-sm text-slate-500 font-medium">
            마음에 드는 귀여운 동물 친구를 콕 눌러주세요 (개인정보는 적지 않아요)
          </p>
        </div>

        {/* Selected badge */}
        <div className="inline-flex items-center gap-2 bg-amber-100/90 text-amber-950 px-4 py-2 rounded-2xl self-start sm:self-auto border border-amber-200">
          <span className="text-2xl">{selectedStudent.animal}</span>
          <span className="font-extrabold text-base sm:text-lg" style={{ fontFamily: "'Jua', sans-serif" }}>
            {selectedStudent.name}
          </span>
          <span className="text-xs bg-amber-500 text-white font-bold px-2 py-0.5 rounded-full">
            선택됨
          </span>
        </div>
      </div>

      {/* Characters Grid with large touch targets (min h-16 / 4rem) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {STUDENT_CHARACTERS.map((char) => {
          const isSelected = char.id === selectedStudent.id;
          return (
            <button
              key={char.id}
              type="button"
              onClick={() => handleSelect(char)}
              className={`relative min-h-[4.5rem] sm:min-h-[5.25rem] p-3 rounded-2xl sm:rounded-3xl border-2 sm:border-3 flex items-center gap-3 transition-all duration-200 cursor-pointer active:scale-95 text-left select-none ${
                isSelected
                  ? 'border-amber-500 bg-amber-100/80 shadow-md shadow-amber-200 ring-4 ring-amber-300/50 -translate-y-0.5'
                  : `${char.themeColor} border-slate-200 hover:border-amber-300 hover:shadow-sm`
              }`}
            >
              {/* Animal Emoji Icon Container */}
              <div
                className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-3xl sm:text-4xl shadow-sm shrink-0 ${char.avatarBg}`}
              >
                {char.animal}
              </div>

              <div className="flex-1 min-w-0">
                <p
                  className={`text-base sm:text-lg font-bold truncate leading-tight ${
                    isSelected ? 'text-amber-950 font-black' : 'text-slate-700'
                  }`}
                  style={{ fontFamily: "'Jua', sans-serif" }}
                >
                  {char.name}
                </p>
                <span className="text-xs text-slate-500 font-medium">탐험대원</span>
              </div>

              {isSelected && (
                <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center shadow shrink-0">
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
};
