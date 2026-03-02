// types/global.d.ts
export {};

declare global {
  interface Window {
    puter: any; // Tạm thời 'any' để đi nhanh vào logic chính, có thể định nghĩa chi tiết sau
  }
}