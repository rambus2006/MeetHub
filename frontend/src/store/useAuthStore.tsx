import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  accessToken: string | null;
  isSignedIn: boolean;
  signIn: (token?: string | null, userId?: number | null) => void;
  signOut: () => void;
  setAccessToken: (token: string | null) => void;
  userId: number | null;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // 기본값
      accessToken: null,
      isSignedIn: false,
      userId: null,

      signIn: (token?: string | null, userId?: number | null) => {
        if (typeof token !== 'undefined') {
          set({ accessToken: token ?? null });
        }
        if (typeof userId !== 'undefined') {
          set({ userId: userId ?? null });
        }
        set({ isSignedIn: true });
      },

      signOut: () => {
        set({
          accessToken: null,
          isSignedIn: false,
          userId: null,
        });
      },

      // 리프레시 토큰 저장/삭제
      setAccessToken: (token: string | null) => {
        set({ accessToken: token });
      },
    }),
    {
      // storage에 저장
      name: 'auth-storage',
      // accessToken과 isSignedIn 모두 저장
      partialize: (state) => ({
        accessToken: state.accessToken,
        isSignedIn: state.isSignedIn,
        userId: state.userId,
      }),
    }
  )
);
