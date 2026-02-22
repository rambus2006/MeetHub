import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type MeetingConnection = {
  roomId: string | null;
  displayName: string | null;
  hostId: number | null;
  serverUrl: string | null;
  token: string | null;
};

type SetConnectionInput = {
  roomId?: string;
  displayName?: string;
  hostId: number | null;
  serverUrl?: string;
  token?: string;
};

type MeetingState = MeetingConnection & {
  setConnection: (payload: SetConnectionInput) => void;
  clear: () => void;
};

export const useMeetingStore = create<MeetingState>()(
  persist(
    (set) => ({
      roomId: null,
      displayName: null,
      hostId: null,
      serverUrl: null,
      token: null,

      setConnection: (payload: SetConnectionInput) => {
        // 저장값 업데이트
        const normalizedRoomId = payload.roomId ?? payload.roomId ?? null;
        set((prev) => ({
          roomId: normalizedRoomId ?? prev.roomId,
          displayName: payload.displayName ?? prev.displayName,
          hostId: payload.hostId ?? prev.hostId,
          serverUrl: payload.serverUrl ?? prev.serverUrl,
          token: payload.token ?? prev.token,
        }));
      },

      clear: () =>
        // 모든 연결 정보를 메모리에서 제거
        set({
          roomId: null,
          displayName: null,
          hostId: null,
          serverUrl: null,
          token: null,
        }),
    }),
    {
      name: 'meeting',
      storage: createJSONStorage(() => sessionStorage),
      // 필요한 키만 저장하고 싶으면 partialize로 제한 가능
    }
  )
);
