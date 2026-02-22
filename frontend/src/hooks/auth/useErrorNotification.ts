// 에러 메시지 추출 함수
export const getErrorMessage = (error: any): string => {
    // 백엔드에서 온 에러 메시지가 있는 경우
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    
    // 에러 코드별 메시지
    const errorCode = error.response?.data?.errorCode || '';
    const status = error.response?.status || 500;
    
    switch (errorCode) {
      case 'A001':
        return '인증이 필요합니다. 다시 로그인해주세요.';
      case 'A002':
        return '현재 비밀번호가 올바르지 않습니다.';
      case 'A003':
        return '비밀번호 변경 권한이 없습니다.';
      case 'C100':
        return '입력값 검증에 실패했습니다. 비밀번호 규칙을 확인해주세요.';
      case 'C101':
        return '필수 입력값이 누락되었습니다.';
      case 'C102':
        return '잘못된 형식입니다.';
      default:
        if (status === 400) {
          return '잘못된 요청입니다. 입력 내용을 확인해주세요.';
        } else if (status === 401) {
          return '인증이 필요합니다. 다시 로그인해주세요.';
        } else if (status === 403) {
          return '접근 권한이 없습니다.';
        } else if (status === 404) {
          return '요청한 리소스를 찾을 수 없습니다.';
        } else if (status === 500) {
          return '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
        } else {
          return '회원정보 수정에 실패했습니다. 다시 시도해주세요.';
        }
    }
  };