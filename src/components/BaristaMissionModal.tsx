import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, X, Check, Volume2, Loader2, Sparkles, RefreshCw, Coffee, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { StudentProfile, MissionRecord } from '../types';
import { playChimeSound, playFanfareSound, speakKoreanText, stopSpeech } from '../services/soundEffects';

interface BaristaMissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: StudentProfile;
  onComplete: (record: Omit<MissionRecord, 'id' | 'timestamp'>) => void;
}

// Sample clean barista setup image (data URL of friendly illustrated cafe tray)
function createSampleBaristaImage(): string {
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 450;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background wooden tray
  ctx.fillStyle = '#f8ecd6';
  ctx.fillRect(0, 0, 600, 450);

  // Tray border
  ctx.strokeStyle = '#c48b52';
  ctx.lineWidth = 14;
  ctx.strokeRect(20, 20, 560, 410);

  // Cup
  ctx.fillStyle = '#e2725b';
  ctx.beginPath();
  ctx.moveTo(220, 140);
  ctx.lineTo(380, 140);
  ctx.lineTo(350, 360);
  ctx.lineTo(250, 360);
  ctx.closePath();
  ctx.fill();

  // Cup Lid
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(200, 120, 200, 30);

  // Straw
  ctx.strokeStyle = '#48cae4';
  ctx.lineWidth = 12;
  ctx.beginPath();
  ctx.moveTo(300, 120);
  ctx.lineTo(330, 50);
  ctx.stroke();

  // Napkin
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(80, 260, 110, 100);
  ctx.strokeStyle = '#e0e0e0';
  ctx.lineWidth = 3;
  ctx.strokeRect(80, 260, 110, 100);

  // Cup Sleeve
  ctx.fillStyle = '#b08968';
  ctx.fillRect(235, 210, 130, 70);

  // Label text
  ctx.fillStyle = '#5c3d2e';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText('⭐ 바리스타 실습 세트 ⭐', 170, 410);

  return canvas.toDataURL('image/jpeg', 0.9);
}

export const BaristaMissionModal: React.FC<BaristaMissionModalProps> = ({
  isOpen,
  onClose,
  student,
  onComplete,
}) => {
  const [activeTab, setActiveTab] = useState<'camera' | 'upload'>('camera');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [resultFeedback, setResultFeedback] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Voice guide on opening
  useEffect(() => {
    if (isOpen) {
      setCapturedImage(null);
      setResultFeedback(null);
      setIsAnalyzing(false);
      speakKoreanText('바리스타 미션! 컵과 빨대, 냅킨을 준비하고 사진을 찍어보세요!');
      if (activeTab === 'camera') {
        startCamera();
      }
    } else {
      stopCamera();
      stopSpeech();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, activeTab]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('이 브라우저는 카메라를 지원하지 않습니다.');
      }
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setCameraError('카메라를 켤 수 없어요. 아래 "사진 올리기"나 "샘플 사진"을 눌러보세요!');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const handleCapturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setCapturedImage(dataUrl);
      stopCamera();
      playChimeSound();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setCapturedImage(result);
      playChimeSound();
    };
    reader.readAsDataURL(file);
  };

  const handleUseSampleImage = () => {
    const sample = createSampleBaristaImage();
    setCapturedImage(sample);
    playChimeSound();
    speakKoreanText('멋진 바리스타 준비 세트 사진을 골랐어요!');
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setResultFeedback(null);
    if (activeTab === 'camera') {
      startCamera();
    }
  };

  const handleSendToGemini = async () => {
    if (!capturedImage) return;

    setIsAnalyzing(true);
    playChimeSound();
    speakKoreanText('선생님이 사진을 살펴보고 있어요! 잠시만 기다려주세요.');

    try {
      const response = await fetch('/api/gemini/analyze-barista', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: capturedImage,
          studentNickname: student.name,
        }),
      });

      const data = await response.json();
      const feedback = data.feedback || `우와, ${student.name} 친구! 컵과 냅킨을 아주 잘 챙겼어요! 최고예요! ⭐`;

      setResultFeedback(feedback);
      playFanfareSound();
      speakKoreanText(feedback);

      // Trigger Confetti blast!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#fbbf24'],
      });

      // Save mission record
      onComplete({
        studentId: student.id,
        studentNickname: student.name,
        studentAnimal: student.animal,
        missionType: 'barista',
        missionTitle: '바리스타 미션 (사진 찍기)',
        status: 'completed',
        feedback,
        photoUrl: capturedImage,
      });
    } catch (err) {
      console.error('Gemini analysis error:', err);
      const fallbackMsg = `우와, ${student.name} 친구! 컵과 빨대를 정말 깔끔하게 놓았네요! 훌륭해요! ⭐`;
      setResultFeedback(fallbackMsg);
      playFanfareSound();
      speakKoreanText(fallbackMsg);

      onComplete({
        studentId: student.id,
        studentNickname: student.name,
        studentAnimal: student.animal,
        missionType: 'barista',
        missionTitle: '바리스타 미션 (사진 찍기)',
        status: 'completed',
        feedback: fallbackMsg,
        photoUrl: capturedImage,
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl border-4 border-amber-300 overflow-hidden">
        {/* Modal Top Header */}
        <div className="bg-gradient-to-r from-amber-400 to-orange-400 px-5 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white text-amber-700 flex items-center justify-center shadow-md">
              <Coffee className="w-7 h-7" />
            </div>
            <div>
              <h3
                className="text-xl sm:text-2xl font-black flex items-center gap-1.5"
                style={{ fontFamily: "'Jua', sans-serif" }}
              >
                <span>바리스타 사진 미션</span>
                <span>☕</span>
              </h3>
              <p className="text-xs sm:text-sm text-amber-100 font-medium">
                음료 컵과 빨대, 냅킨을 준비하고 찰칵 찍어봐요!
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

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {/* Visual Checklist for Special Education Students */}
          <div className="bg-amber-50 rounded-2xl p-3 sm:p-4 border border-amber-200">
            <p
              className="text-sm sm:text-base font-extrabold text-amber-950 mb-2 flex items-center gap-1.5"
              style={{ fontFamily: "'Jua', sans-serif" }}
            >
              <span>준비물 확인:</span>
              <span className="text-slate-600 font-normal text-xs sm:text-sm">사진 속에 아래 물건이 있나요?</span>
            </p>
            <div className="grid grid-cols-3 gap-2 text-center text-xs sm:text-sm font-bold text-amber-900">
              <div className="bg-white py-2 px-1 rounded-xl border border-amber-200 shadow-2xs flex flex-col items-center">
                <span className="text-2xl">🥤</span>
                <span>음료 컵</span>
              </div>
              <div className="bg-white py-2 px-1 rounded-xl border border-amber-200 shadow-2xs flex flex-col items-center">
                <span className="text-2xl">🥢</span>
                <span>빨대</span>
              </div>
              <div className="bg-white py-2 px-1 rounded-xl border border-amber-200 shadow-2xs flex flex-col items-center">
                <span className="text-2xl">🧻</span>
                <span>냅킨</span>
              </div>
            </div>
          </div>

          {/* Mode Tabs: Camera vs Upload */}
          {!capturedImage && !resultFeedback && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('camera')}
                className={`flex-1 h-13 rounded-2xl font-bold flex items-center justify-center gap-2 text-sm sm:text-base transition-all cursor-pointer ${
                  activeTab === 'camera'
                    ? 'bg-amber-500 text-white shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Camera className="w-5 h-5" />
                <span>카메라로 촬영</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                className={`flex-1 h-13 rounded-2xl font-bold flex items-center justify-center gap-2 text-sm sm:text-base transition-all cursor-pointer ${
                  activeTab === 'upload'
                    ? 'bg-amber-500 text-white shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Upload className="w-5 h-5" />
                <span>사진 보관함</span>
              </button>
            </div>
          )}

          {/* Viewfinder / Preview Display */}
          <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-slate-900 flex items-center justify-center border-2 border-slate-200 shadow-inner">
            {capturedImage ? (
              <img
                src={capturedImage}
                alt="바리스타 미션 사진"
                className="w-full h-full object-cover"
              />
            ) : activeTab === 'camera' ? (
              cameraError ? (
                <div className="p-5 text-center text-white space-y-3">
                  <AlertCircle className="w-12 h-12 text-amber-400 mx-auto" />
                  <p className="text-sm font-bold text-amber-100">{cameraError}</p>
                  <button
                    type="button"
                    onClick={handleUseSampleImage}
                    className="h-12 px-5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-white font-extrabold text-sm shadow-md cursor-pointer"
                  >
                    샘플 바리스타 사진으로 바로 해보기 ✨
                  </button>
                </div>
              ) : (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 border-4 border-dashed border-white/50 rounded-2xl pointer-events-none m-4 flex items-center justify-center">
                    <span className="bg-black/60 text-white text-xs sm:text-sm font-bold px-3 py-1.5 rounded-xl backdrop-blur-xs">
                      네모 칸 안에 컵과 빨대를 쏙 넣어주세요
                    </span>
                  </div>
                </>
              )
            ) : (
              <div className="p-6 text-center text-slate-200 space-y-4">
                <Upload className="w-14 h-14 mx-auto text-amber-400" />
                <p className="text-base font-bold">사진 파일(JPG, PNG)을 선택해주세요</p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-14 px-6 rounded-2xl bg-amber-500 hover:bg-amber-400 text-white font-extrabold text-base shadow-md cursor-pointer inline-flex items-center gap-2"
                >
                  <Upload className="w-5 h-5" />
                  <span>내 기기에서 사진 찾기</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            )}

            {isAnalyzing && (
              <div className="absolute inset-0 bg-black/75 backdrop-blur-xs flex flex-col items-center justify-center text-white p-6 text-center space-y-3 z-10">
                <Loader2 className="w-14 h-14 text-amber-400 animate-spin" />
                <p className="text-xl font-black" style={{ fontFamily: "'Jua', sans-serif" }}>
                  AI 선생님이 사진을 꼼꼼히 보고 있어요!
                </p>
                <p className="text-xs sm:text-sm text-amber-200">
                  컵, 빨대, 냅킨을 멋지게 놓았는지 확인 중이에요 ✨
                </p>
              </div>
            )}
          </div>

          {/* Direct Sample Image Button for Zero-Barrier Access */}
          {!capturedImage && (
            <div className="flex items-center justify-center">
              <button
                type="button"
                onClick={handleUseSampleImage}
                className="text-xs sm:text-sm font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>카메라가 없을 땐? "샘플 바리스타 사진으로 체험하기" 클릭!</span>
              </button>
            </div>
          )}

          {/* AI Result & Praise Display */}
          {resultFeedback && (
            <div className="bg-emerald-50 rounded-2xl p-4 sm:p-5 border-2 border-emerald-300 shadow-sm space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-base sm:text-lg">
                  <span className="text-2xl">⭐</span>
                  <span style={{ fontFamily: "'Jua', sans-serif" }}>바리스타 선생님의 칭찬 말씀</span>
                </div>
                <button
                  type="button"
                  onClick={() => speakKoreanText(resultFeedback)}
                  className="h-10 px-3 rounded-xl bg-emerald-200/80 hover:bg-emerald-300 text-emerald-900 flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer active:scale-95"
                  title="칭찬 다시 듣기"
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
                  {resultFeedback}
                </p>
              </div>

              <div className="flex items-center justify-center gap-2 pt-1 text-emerald-700 font-bold text-xs sm:text-sm">
                <span>황금 별 스탬프가 성공적으로 기록되었어요!</span>
                <span>⭐</span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Controls (min h-16 for accessibility) */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row gap-3">
          {resultFeedback ? (
            <button
              type="button"
              onClick={onClose}
              className="w-full h-16 sm:h-18 rounded-2xl sm:rounded-3xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xl sm:text-2xl shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
              style={{ fontFamily: "'Jua', sans-serif" }}
            >
              <Check className="w-7 h-7 stroke-[3]" />
              <span>우와! 미션 완료! 별 받기 ⭐</span>
            </button>
          ) : capturedImage ? (
            <div className="flex w-full gap-3">
              <button
                type="button"
                onClick={handleRetake}
                disabled={isAnalyzing}
                className="flex-1 h-16 rounded-2xl sm:rounded-3xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-extrabold text-base sm:text-lg flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className="w-5 h-5" />
                <span>다시 찍기</span>
              </button>
              <button
                type="button"
                onClick={handleSendToGemini}
                disabled={isAnalyzing}
                className="flex-[2] h-16 sm:h-18 rounded-2xl sm:rounded-3xl bg-amber-500 hover:bg-amber-600 text-white font-black text-lg sm:text-xl shadow-lg shadow-amber-200 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                style={{ fontFamily: "'Jua', sans-serif" }}
              >
                <Sparkles className="w-6 h-6" />
                <span>선생님께 사진 보여드리기! ✨</span>
              </button>
            </div>
          ) : activeTab === 'camera' && !cameraError ? (
            <button
              type="button"
              onClick={handleCapturePhoto}
              className="w-full h-16 sm:h-18 rounded-2xl sm:rounded-3xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xl sm:text-2xl shadow-lg shadow-amber-200 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
              style={{ fontFamily: "'Jua', sans-serif" }}
            >
              <Camera className="w-8 h-8" />
              <span>찰칵! 사진 찍기 📸</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-16 sm:h-18 rounded-2xl sm:rounded-3xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xl sm:text-2xl shadow-lg shadow-amber-200 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
              style={{ fontFamily: "'Jua', sans-serif" }}
            >
              <Upload className="w-7 h-7" />
              <span>사진 고르기</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
