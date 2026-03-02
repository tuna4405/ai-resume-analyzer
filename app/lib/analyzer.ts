// app/lib/analyzer.ts
// analyzer.ts: Nhận file $\rightarrow$ Đẩy lên Cloud $\rightarrow$ Bắn Prompt cho AI $\rightarrow$ Lưu kết quả JSON.
// auth.ts: Quản lý chìa khóa (đăng nhập/đăng xuất) để ra vào hệ thống.
// Cloud.storage.ts: Lấy kết quả phân tích từ Cloud về để ứng dụng sử dụng.
// Hàm này giúp chuẩn bị Prompt cực kỳ chặt chẽ
const prepareInstructions = (jobTitle: string, jobDescription: string) => {
  return `
    You are an elite Senior Tech Recruiter and an advanced ATS Algorithm Expert.
    Your task is to ruthlessly but constructively analyze the provided resume against this role:
    - Job Title: ${jobTitle}
    - Job Description: ${jobDescription}

    INSTRUCTIONS:
    1. Identify exact missing keywords and hard skills.
    2. Evaluate the impact of bullet points (Are they quantifiable? E.g., "Increased sales by 20%" vs "Helped with sales").
    3. Provide actionable, rewritten examples for weak bullet points.
    
    CRITICAL: Respond ONLY with a valid JSON object matching this exact schema. No markdown, no pre-text.
    
    {
      "overallScore": 85,
      "summary": "A brief, 2-sentence executive summary of their fit.",
      "missingKeywords": ["GraphQL", "CI/CD"],
      "actionableFeedback": [
        "Move the skills section to the top.",
        "Quantify your experience in the second role."
      ],
      "bulletPointMakeovers": [
        {
          "original": "Worked on backend API",
          "rewritten": "Designed and deployed RESTful APIs using Node.js, reducing average response time by 150ms.",
          "reason": "Adds specific technology and quantifiable business impact."
        }
      ],
      "categories": {
        "toneAndStyle": { "score": 90, "feedback": "Professional and concise." },
        "contentAndImpact": { "score": 70, "feedback": "Lacks metrics. Use the STAR method." },
        "atsCompatibility": { "score": 85, "feedback": "Formatting is clean, no complex tables." }
      }
    }
  `;
};

// Hàm chính để chạy toàn bộ luồng
export const processResume = async (file: File, jobTitle: string, jobDescription: string) => {
  try {
    // 1. Ném file lên Cloud Storage
    const uploadResult = await window.puter.fs.upload([file]);
    const resumePath = uploadResult.path;

    // 2. Lấy Prompt đã chuẩn bị
    const instructions = prepareInstructions(jobTitle, jobDescription);

    // 3. Gửi cho AI phân tích
    const aiResponse = await window.puter.ai.chat(instructions, resumePath);
    
    // 4. Lấy Text và ép kiểu về JSON (xử lý lỗi phòng hờ AI trả về tào lao)
    let feedbackText = aiResponse.message.content;
    
    // Mẹo nhỏ: Đôi khi AI vẫn trả về ```json ... ``` dù đã cấm, đoạn này giúp dọn dẹp sạch sẽ
    feedbackText = feedbackText.replace(/```json/g, "").replace(/```/g, "").trim();
    
    const feedbackJSON = JSON.parse(feedbackText);

    // 5. Lưu vào Key-Value database để tái sử dụng
    const uuid = crypto.randomUUID();
    const resultData = {
        id: uuid,
        resumePath: resumePath,
        jobTitle: jobTitle,
        jobDescription: jobDescription,
        feedback: feedbackJSON
    };
    
    await window.puter.kv.set(`resume_${uuid}`, JSON.stringify(resultData));

    return resultData;

  } catch (error) {
    console.error("Lỗi mẹ nó rồi:", error);
    throw error;
  }
};