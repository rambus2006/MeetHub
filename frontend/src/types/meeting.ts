// API 요청 타입
export interface CreateMeetingRequest {
  displayName: string;
  password: string;
}

// API 응답 타입
export interface CreateMeetingResponse {
  roomId: string;
  displayName: string;
  hostId: number;
  serverUrl: string;
  token: string;
}

// 폼 데이터 타입
export interface CreateMeetingFormData {
  displayName: string;
  password: string;
}

// 회의 입장 API 요청 타입
export interface EnterMeetingRequest {
  roomId: string;
  password: string;
}

// 회의 입장 API 응답 타입
export interface EnterMeetingResponse {
  roomId: string;
  displayName: string;
  hostId: number;
  serverUrl: string;
  token: string;
}

// 폼 데이터 타입
export interface EnterMeetingFormData {
  roomId: string;
  password: string;
}
