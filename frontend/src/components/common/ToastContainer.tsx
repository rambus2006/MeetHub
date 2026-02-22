import { useToastStore } from '../../store/useToastStore';
import Toast from './Toast';

const ToastContainer = () => {
  const { toasts } = useToastStore();

  return (
    <div className='fixed left-1/2 top-4 z-[70] -translate-x-1/2 transform space-y-2'>
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} />
      ))}
    </div>
  );
};

export default ToastContainer;
