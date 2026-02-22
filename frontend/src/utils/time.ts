/**
 * 밀리초(ms)를 'M:SS' 형식의 문자열로 변환
 * @param milliseconds - 변환할 밀리초
 * @returns 'M:SS' 형식의 시간 문자열
 */
export const formatMsToTime = (milliseconds: number): string => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};
