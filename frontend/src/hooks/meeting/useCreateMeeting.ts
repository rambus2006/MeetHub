import { useState } from 'react';

import { createMeeting } from '../../api/meetingService';
import type {
  CreateMeetingFormData,
  CreateMeetingResponse,
} from '../../types/meeting';

import { useToast } from '../common/useToast';

interface useCreateMeetingReturn {
  formData: CreateMeetingFormData;
  handleCreateMeeting: () => Promise<CreateMeetingResponse | null>;
  handleCreateMeetingChange: (field: string, value: string) => void;
  isFormValid: () => boolean;
}

export const useCreateMeeting = (): useCreateMeetingReturn => {
  const { showSuccess, showError } = useToast();

  const [formData, setFormData] = useState<CreateMeetingFormData>({
    displayName: '',
    password: '',
  });

  //   입력값 변경
  const handleCreateMeetingChange = (field: string, value: string): void => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // 회의 생성 함수
  const handleCreateMeeting =
    async (): Promise<CreateMeetingResponse | null> => {
      try {
        const createMeetingData = {
          displayName: formData.displayName,
          password: formData.password,
        };

        const response = await createMeeting(createMeetingData);

        if (response.success) {
          showSuccess('회의가 생성되었습니다.');
          return response.content;
        }
        return null;
      } catch (err) {
        const msg = (err as any)?.response?.data?.message;
        showError(
          msg || '회의 생성 중 오류가 발생했습니다. 다시 시도해주세요.'
        );
        return null;
      }
    };

  //   폼 유효 검사
  const isFormValid = (): boolean => {
    return Boolean(formData.displayName);
  };
  return {
    formData,
    handleCreateMeeting,
    handleCreateMeetingChange,
    isFormValid,
  };
};
