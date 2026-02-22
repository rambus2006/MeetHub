import { useState } from 'react';
import { enterMeeting } from '../../api/meetingService';
import type {
  EnterMeetingFormData,
  EnterMeetingResponse,
} from '../../types/meeting';
import { useToast } from '../common/useToast';

interface useEnterMeetingReturn {
  formData: EnterMeetingFormData;
  handleEnterMeeting: () => Promise<EnterMeetingResponse | null>;
  handleEnterMeetingChange: (field: string, value: string) => void;
  isFormValid: () => boolean;
}

export const useEnterMeeting = (): useEnterMeetingReturn => {
  const { showSuccess, showError } = useToast();

  const [formData, setFormData] = useState<EnterMeetingFormData>({
    roomId: '',
    password: '',
  });

  // 입력값 변경
  const handleEnterMeetingChange = (field: string, value: string): void => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // 회의 생성 함수
  const handleEnterMeeting = async (): Promise<EnterMeetingResponse | null> => {
    try {
      const enterMeetingData = {
        roomId: formData.roomId,
        password: formData.password,
      };

      const response = await enterMeeting(enterMeetingData);

      if (response.success && response.content) {
        showSuccess('회의에 정상적으로 입장하셨습니다.');
        return response.content;
      }
      return null;
    } catch (err) {
      const msg = (err as any)?.response?.data?.message;
      showError(msg || '회의 입장 중 오류가 발생했습니다. 다시 시도해주세요.');
      return null;
    }
  };

  // 폼 유효 검사
  const isFormValid = (): boolean => {
    return Boolean(formData.roomId);
  };

  return {
    formData,
    handleEnterMeeting,
    handleEnterMeetingChange,
    isFormValid,
  };
};
