import apiClient from './axiosInstance';
import type { ApiResponse } from '../types/api';

import type {
  CreateMeetingRequest,
  CreateMeetingResponse,
  EnterMeetingRequest,
  EnterMeetingResponse,
} from '../types/meeting';

// 회의 생성 API
export const createMeeting = async (
  createMeetingData: CreateMeetingRequest
): Promise<ApiResponse<CreateMeetingResponse>> => {
  const response = await apiClient.post<ApiResponse<CreateMeetingResponse>>(
    '/meetings',
    createMeetingData
  );
  return response.data;
};

// 회의 입장 API
export const enterMeeting = async (
  enterMeetingData: EnterMeetingRequest
): Promise<ApiResponse<EnterMeetingResponse>> => {
  const response = await apiClient.post<ApiResponse<EnterMeetingResponse>>(
    '/meetings/join',
    enterMeetingData
  );
  return response.data;
};
