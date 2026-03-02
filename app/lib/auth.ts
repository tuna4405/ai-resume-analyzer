// app/lib/auth.ts

// Gọi hàm này khi người dùng muốn bắt đầu sử dụng App
export const loginWithPuter = async () => {
  // Kiểm tra xem đã đăng nhập chưa
  const isSignedIn = window.puter.auth.isSignedIn();
  
  if (!isSignedIn) {
    // Nếu chưa, Puter sẽ tự bật popup đăng nhập an toàn
    await window.puter.auth.signIn();
  }
  
  // Trả về thông tin user (id, username...)
  return window.puter.auth.getUser();
};

export const logoutPuter = () => {
  window.puter.auth.signOut();
};