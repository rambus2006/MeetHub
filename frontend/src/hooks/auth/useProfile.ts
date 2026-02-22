import { getUserProfile } from "../../api/authService";

export const fetchUserProfile = async () => {
  try {
    const res = await getUserProfile();
    if (res) {
      // 필요한 정보만 로컬스토리지에 저장
      const userData = {
        name: res.name,
        email: res.email,
      };
      localStorage.setItem('user', JSON.stringify(userData));
      return userData; // 필요하면 반환
    } else {
      console.error('프로필 조회 실패');
    }
  } catch (err) {
    console.error('API 호출 오류', err);
  }
};
