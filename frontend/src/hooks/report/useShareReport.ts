import { useState } from 'react';
import { validateEmail } from '../auth/useAuthValidation';
import { viewPermission, grantPermission } from '../../api/reportService';
import type { PermissionsResponse } from '../../types/report';

type Permission = 'VIEWER' | 'EDITOR';

interface ShareFormData {
  email: string;
  permission: Permission;
}

interface ShareErrors {
  email: string;
}

export function useShareReport(defaults?: Partial<ShareFormData>) {
  const [formData, setFormData] = useState<ShareFormData>({
    email: defaults?.email ?? '',
    permission: defaults?.permission ?? 'VIEWER',
  });

  const [errors, setErrors] = useState<ShareErrors>({
    email: '',
  });

  const [permissions, setPermissions] = useState<PermissionsResponse[]>([]);
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(false);
  const [permissionsError, setPermissionsError] = useState<string>('');
  const [isGranting, setIsGranting] = useState(false);
  const [grantError, setGrantError] = useState<string>('');

  // 권한 입력값 핸들러
  const handleInputChange = (field: keyof ShareFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }) as ShareFormData);

    if (field === 'email') {
      setErrors((prev) => ({ ...prev, email: validateEmail(value) }));
    }
  };

  const isFormValid = (): boolean => {
    return Boolean(formData.email) && !errors.email;
  };

  const resetForm = () => {
    setFormData({ email: '', permission: 'VIEWER' });
    setErrors({ email: '' });
  };

  // 권한 목록 조회 API 호출
  const fetchPermissions = async (reportId: number | string) => {
    if (!reportId && reportId !== 0) return;
    setIsLoadingPermissions(true);
    setPermissionsError('');
    try {
      const res = await viewPermission(
        typeof reportId === 'string' ? Number(reportId) : reportId
      );
      const content: any = (res as any)?.content;
      let list: PermissionsResponse[] = [];
      if (Array.isArray(content)) {
        list = content as PermissionsResponse[];
      } else if (content) {
        list = [content as PermissionsResponse];
      }
      setPermissions(list);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        '권한 목록을 불러오지 못했습니다.';
      setPermissionsError(msg);
      setPermissions([]);
    } finally {
      setIsLoadingPermissions(false);
    }
  };

  // 권한 부여 API 호출
  const grant = async (
    reportId: number | string,
    payload?: { email: string; permission: Permission }
  ) => {
    if (!reportId && reportId !== 0) return;
    const targetEmail = payload?.email ?? formData.email;
    const targetPermission = payload?.permission ?? formData.permission;
    setIsGranting(true);
    setGrantError('');
    try {
      const idNum = typeof reportId === 'string' ? Number(reportId) : reportId;
      await grantPermission(idNum, targetEmail, targetPermission);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || '공유에 실패했습니다.';
      setGrantError(msg);
      throw err;
    } finally {
      setIsGranting(false);
    }
  };

  return {
    formData,
    errors,
    handleInputChange,
    isFormValid,
    resetForm,
    permissions,
    isLoadingPermissions,
    permissionsError,
    fetchPermissions,
    grant,
    isGranting,
    grantError,
  };
}
