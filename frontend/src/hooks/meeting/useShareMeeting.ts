// 타입 => 여쭤보고 나중에 옮기기
export interface ShareModalProps {
    open: boolean;
    onClose: () => void;
    urlToShare: string;
    onCopySuccess?: () => void;
  }