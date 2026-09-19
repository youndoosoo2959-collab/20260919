export type MissionType = 'barista' | 'greeting';

export interface StudentProfile {
  id: string;
  name: string; // e.g., '씩씩한 토끼'
  animal: string; // e.g., '🐰'
  themeColor: string;
  avatarBg: string;
}

export interface MissionRecord {
  id: string;
  studentId: string;
  studentNickname: string;
  studentAnimal: string;
  missionType: MissionType;
  missionTitle: string;
  status: 'completed';
  feedback: string;
  photoUrl?: string;
  timestamp: number;
}

export interface BroadcastMessage {
  id: string;
  type: 'praise_all' | 'system';
  message: string;
  teacherName?: string;
  timestamp: number;
}

export type AppViewMode = 'student' | 'teacher';
