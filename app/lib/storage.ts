// app/lib/storage.ts

// Hàm 1: Lấy chi tiết 1 bài phân tích dựa vào ID
export const getResumeAnalysis = async (uuid: string) => {
  try {
    // Kéo chuỗi JSON từ database Key-Value của Puter
    const dataStr = await window.puter.kv.get(`resume_${uuid}`);
    if (!dataStr) return null;

    const parsedData = JSON.parse(dataStr);
    return parsedData; // Trả về toàn bộ điểm số, feedback, đường dẫn file...
  } catch (error) {
    console.error("Lỗi khi kéo dữ liệu:", error);
    return null;
  }
};

// Hàm 2: Lấy toàn bộ lịch sử các CV đã phân tích (để mốt làm trang Home)
export const getAllResumes = async () => {
  try {
    // Tìm tất cả các key bắt đầu bằng "resume_"
    const items = await window.puter.kv.list('resume_*', true);
    
    // Convert đống data đó thành mảng JSON
    return items.map((item: any) => JSON.parse(item.value));
  } catch (error) {
    console.error("Lỗi khi lấy danh sách:", error);
    return [];
  }
};