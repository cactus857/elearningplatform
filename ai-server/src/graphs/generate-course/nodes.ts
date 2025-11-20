import { createLLM } from "../../llm/gemini.js";
import { CourseStateAnnotationType } from "./state.js";

// Node 1: tạo outline
export const generateOutlineNode = async (state: CourseStateAnnotationType) => {
  const llm = createLLM();

  try {
    const res = await llm.invoke([
      {
        role: "system",
        content: "Bạn là chuyên gia thiết kế khóa học.",
      },
      {
        role: "user",
        content: `
          Hãy tạo outline ${state.chapterCount} chương cho khóa học:
          - Tiêu đề: ${state.title}
          - Mô tả: ${state.description}
          - Trả về dạng danh sách, mỗi dòng 1 chương. Lưu ý: chỉ trả lời thẳng danh sách chương thôi nhé.
        `,
      },
    ]);

    const text = String(res.content);
    const lines = text
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    return { outline: lines };
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// Node 2: tạo nội dung chi tiết cho từng chương
export const generateChaptersNode = async (
  state: CourseStateAnnotationType
) => {
  const llm = createLLM();

  if (!state.outline || state.outline.length === 0) {
    throw new Error("Outline chưa được tạo");
  }

  const chapters = [];

  for (const chapterTitle of state.outline) {
    try {
      const res = await llm.invoke([
        {
          role: "system",
          content:
            "Bạn là giảng viên backend, viết nội dung chi tiết nhưng dễ hiểu.",
        },
        {
          role: "user",
          content: `
            Viết nội dung chi tiết cho chương: "${chapterTitle}"
            Trong khóa học: ${state.title}
            Mô tả khóa học: ${state.description}

            Lưu ý: trả lời thẳng nội dung chương, không cần lặp lại tiêu đề chương.
          `,
        },
      ]);

      chapters.push({
        title: chapterTitle,
        content: String(res.content),
      });
    } catch (error) {
      console.error(error);

      throw error;
    }
  }

  return { chapters };
};

// Node 3: summary khóa học
export const generateSummaryNode = async (state: CourseStateAnnotationType) => {
  const llm = createLLM();

  try {
    const res = await llm.invoke([
      {
        role: "system",
        content: "Bạn là copywriter, tóm tắt khóa học.",
      },
      {
        role: "user",
        content: `
          Tóm tắt ngắn gọn khóa học với các chương sau:
          ${state.chapters?.map((c) => "- " + c.title).join("\n")}
        `,
      },
    ]);
    return { summary: String(res.content) };
  } catch (error) {
    console.error(error);
    throw error;
  }
};
