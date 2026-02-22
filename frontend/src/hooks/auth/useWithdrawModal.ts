import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../common/useToast';
import { withdraw } from '../../api/authService';

export const useWithdrawModal = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  const openWithdrawModal = () => {
    setShowWithdrawModal(true);
  };

  const closeWithdrawModal = () => {
    setShowWithdrawModal(false);
  };

  const handleWithdraw = async () => {
    try {
      await withdraw();
      showSuccess('회원탈퇴가 완료되었습니다.');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      navigate('/signin');
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || '회원탈퇴에 실패했습니다. 다시 시도해주세요.';
      showError(errorMessage);
    }
    setShowWithdrawModal(false);
  };

  return {
    showWithdrawModal,
    openWithdrawModal,
    closeWithdrawModal,
    handleWithdraw,
  };
};


