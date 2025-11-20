// import { courseGraph } from "./graphs/generate-course/graph";

import { generateCourseTool } from "./tools/course-tools.js";

// async function main() {
//   console.log("🚀 Bắt đầu chạy courseGraph...");

//   try {
//     const result = await courseGraph.invoke({
//       title: "Java Springboot Backend for Beginners",
//       description: "Khóa học thực hành Java springboot cho sinh viên IT.",
//       chapterCount: 3,
//     });

//     console.log("✅ Kết quả nhận được từ graph:");
//     console.log(JSON.stringify(result, null, 2));
//   } catch (err) {
//     console.error("❌ Lỗi khi chạy graph:", err);
//   }
// }

// main();

async function main() {
  const result = await generateCourseTool.execute({
    title: "Test Tool",
    description: "Tool test",
    chapterCount: 2,
  });

  console.log("KẾT QUẢ TOOL:", result);
}

main();
