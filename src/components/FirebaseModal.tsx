import React, { useState } from 'react';
import { X, Database, CheckCircle, Copy, Check, ShieldCheck, Sparkles, AlertCircle, Info } from 'lucide-react';
import { isFirebaseConfigured } from '../services/firebase';

interface FirebaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FirebaseModal: React.FC<FirebaseModalProps> = ({ isOpen, onClose }) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const sampleEnv = `VITE_FIREBASE_API_KEY="AIzaSy..."
VITE_FIREBASE_AUTH_DOMAIN="sparkle-jobs.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="sparkle-jobs"
VITE_FIREBASE_STORAGE_BUCKET="sparkle-jobs.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="123456789"
VITE_FIREBASE_APP_ID="1:123456789:web:abcdef"
GEMINI_API_KEY="AIzaSy..."`;

  const firestoreRules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // missions 컬렉션: 누구나 완료 기록 작성 및 실시간 조회 가능 (익명 닉네임만 포함)
    match /missions/{missionId} {
      allow read, create: if true;
      allow update, delete: if false; // 학생 데이터 위변조 방지
    }
    // broadcasts 컬렉션: 교사 칭찬 메시지 브로드캐스트
    match /broadcasts/{broadcastId} {
      allow read, create: if true;
      allow update, delete: if false;
    }
  }
}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border-4 border-amber-300 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white text-amber-700 flex items-center justify-center shadow-md">
              <Database className="w-7 h-7" />
            </div>
            <div>
              <h3
                className="text-xl sm:text-2xl font-black"
                style={{ fontFamily: "'Jua', sans-serif" }}
              >
                데이터베이스 및 Firebase 연동 안내
              </h3>
              <p className="text-xs sm:text-sm text-amber-100 font-medium">
                현재 연결 상태와 배포 시 설정 가이드
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-black/15 hover:bg-black/25 flex items-center justify-center text-white transition-all cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5 text-slate-700 text-sm">
          {/* Status Alert Banner */}
          <div
            className={`p-4 rounded-2xl border flex items-start gap-3 ${
              isFirebaseConfigured
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : 'bg-amber-50 border-amber-300 text-amber-900'
            }`}
          >
            {isFirebaseConfigured ? (
              <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <Info className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <h4 className="font-extrabold text-base">
                {isFirebaseConfigured
                  ? '🟢 Firebase Cloud Firestore 실시간 연결 완료'
                  : '🟡 현재 상태: 실시간 모의(Mock) 동기화 모드 작동 중'}
              </h4>
              <p className="text-xs sm:text-sm leading-relaxed">
                {isFirebaseConfigured
                  ? '학생들이 완료한 미션과 교사 칭찬 메시지가 Firebase Cloud Firestore에 실시간 동기화되고 있습니다.'
                  : '현재 Firebase 설정값이 없는 상태에서도 브라우저의 BroadcastChannel과 로컬 저장소를 활용해 여러 탭이나 창 간에 실시간 동기화 및 칭찬 방송이 원활하게 동작합니다.'}
              </p>
            </div>
          </div>

          {/* Privacy & Safety Guarantee */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-extrabold text-base">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              <span>특수교육 학생 개인정보 완전 보호 원칙</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-600">
              본 앱은 학생의 실제 성명, 학번, 연락처 등 민감한 개인정보를 일절 요구하거나 저장하지 않습니다.
              귀여운 동물 캐릭터 닉네임('씩씩한 토끼', '다정한 곰돌이' 등)만 사용하여 교사와 학생 간의 실시간 피드백을 안전하게 제공합니다.
            </p>
          </div>

          {/* Environment Variables Guide */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-slate-900 text-sm">
                Vercel / 배포 환경 변수 (.env) 예시:
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(sampleEnv, 'env')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
              >
                {copiedSection === 'env' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSection === 'env' ? '복사됨!' : '복사하기'}</span>
              </button>
            </div>
            <pre className="bg-slate-900 text-slate-200 p-3.5 rounded-2xl text-xs overflow-x-auto font-mono">
              {sampleEnv}
            </pre>
          </div>

          {/* Firestore Security Rules */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-slate-900 text-sm">
                권장 Cloud Firestore 보안 규칙 (firestore.rules):
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(firestoreRules, 'rules')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
              >
                {copiedSection === 'rules' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSection === 'rules' ? '복사됨!' : '복사하기'}</span>
              </button>
            </div>
            <pre className="bg-slate-900 text-emerald-400 p-3.5 rounded-2xl text-xs overflow-x-auto font-mono">
              {firestoreRules}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="w-full h-14 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-base transition-all cursor-pointer"
          >
            확인 및 닫기
          </button>
        </div>
      </div>
    </div>
  );
};
