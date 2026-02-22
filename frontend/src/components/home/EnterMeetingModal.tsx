import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMeetingStore } from '../../store/useMeetingStore';
import { useEnterMeeting } from '../../hooks/meeting/useEnterMeeting';
import Input from '../common/Input';
import Button from '../common/Button';

interface EnterMeetingModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onSubmit: () => void;
  readonly isSubmitting?: boolean;
}

const EnterMeetingModal = ({
  isOpen,
  onClose,
  // onSubmit,
  isSubmitting = false,
}: EnterMeetingModalProps) => {
  const {
    formData,
    handleEnterMeeting,
    handleEnterMeetingChange,
    isFormValid,
  } = useEnterMeeting();

  const [_touched, setTouched] = useState(false);
  const [_submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();
  const setConnection = useMeetingStore((s) => s.setConnection);

  // 모달이 닫힐 때 필드 초기화
  useEffect(() => {
    if (!isOpen) {
      handleEnterMeetingChange('roomId', '');
      handleEnterMeetingChange('password', '');
      setTouched(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOverlayClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleConfirm = async () => {
    setTouched(true);
    if (!formData.roomId.trim()) return;

    setSubmitting(true);

    try {
      const result = await handleEnterMeeting();
      if (result) {
        setConnection({
          roomId: result.roomId,
          displayName: result.displayName,
          hostId: result.hostId,
          serverUrl: result.serverUrl,
          token: result.token,
        });
        navigate(`/meeting?roomId=${result.roomId}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center'
      onClick={handleOverlayClick}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose();
      }}
    >
      <section className='w-full max-w-xl rounded-2xl border border-meethub-blue bg-white p-8 shadow-xl'>
        <header className='mb-6 text-center'>
          <h2 className='text-2xl font-extrabold tracking-tight text-meethub-blue'>
            회의 입장
          </h2>
        </header>

        <div className='space-y-5 p-1'>
          <Input
            label='회의 ID'
            placeholder='회의 ID를 입력해주세요'
            value={formData.roomId}
            onChange={(e) => {
              handleEnterMeetingChange('roomId', e.target.value);
            }}
            required
            // error={nameError}
          />

          <Input
            label='비밀번호 (선택)'
            placeholder='비밀번호를 입력해주세요 (선택)'
            type='password'
            value={formData.password}
            onChange={(e) => {
              handleEnterMeetingChange('password', e.target.value);
            }}
          />

          <div className='space-y-3 pt-2'>
            <Button
              onClick={handleConfirm}
              disabled={!isFormValid() || isSubmitting}
            >
              입장하기
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default EnterMeetingModal;
