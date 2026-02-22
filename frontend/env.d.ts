interface ImportMetaEnv {
  readonly VITE_SERVER_URL: string;
  // 여기에 추가로 쓰는 환경 변수 타입 작성
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
