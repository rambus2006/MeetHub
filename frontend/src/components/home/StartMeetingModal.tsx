import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMeetingStore } from '../../store/useMeetingStore';

import { useCreateMeeting } from '../../hooks/meeting/useCreateMeeting';

import Input from '../common/Input';
import Button from '../common/Button';

interface StartMeetingModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onSubmit: () => void;
  readonly isSubmitting?: boolean;
}

function StartMeetingModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting: _isSubmitting = false,
}: StartMeetingModalProps) {
  const {
    formData,
    handleCreateMeeting,
    handleCreateMeetingChange,
    isFormValid,
  } = useCreateMeeting();

  const navigate = useNavigate();
  const setConnection = useMeetingStore((s) => s.setConnection);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      handleCreateMeetingChange('displayName', '');
      handleCreateMeetingChange('password', '');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOverlayClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className='fixed inset-0 z-50 grid place-items-center bg-black/50 px-4'
      onClick={handleOverlayClick}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose();
      }}
    >
      <section className='border-meethub-blue w-full max-w-xl rounded-2xl border bg-white p-8 shadow-xl'>
        <header className='mb-6 text-center'>
          <h2 className='text-meethub-blue text-2xl font-extrabold tracking-tight'>
            회의 시작
          </h2>
        </header>

        <div className='space-y-5 p-1'>
          <Input
            label='회의 이름'
            placeholder='회의 이름을 입력해주세요'
            value={formData.displayName}
            onChange={(e) => {
              handleCreateMeetingChange('displayName', e.target.value);
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
              handleCreateMeetingChange('password', e.target.value);
            }}
          />

          <div className='space-y-3 pt-2'>
            <Button
              onClick={async () => {
                setSubmitting(true);
                onSubmit();
                try {
                  const result = await handleCreateMeeting();
                  if (result) {
                    setConnection({
                      roomId: result.roomId,
                      displayName: result.displayName,
                      hostId: result.hostId,
                      serverUrl: result.serverUrl,
                      token: result.token,
                    });
                    onClose();
                    navigate(`/meeting?roomId=${result.roomId}`);
                  }
                } finally {
                  setSubmitting(false);
                }
              }}
              disabled={!isFormValid() || submitting}
            >
              {submitting ? '회의 시작 중' : '회의 시작'}
            </Button>
            <button
              type='button'
              onClick={onClose}
              className='block w-full rounded-md border border-gray-300 px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50'
            >
              취소
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default StartMeetingModal;
