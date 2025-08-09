export const getColorStyle = (color?: string) => {
  if (!color) return { backgroundColor: "#cccccc" }; // nếu null/undefined thì trả về màu mặc định

  const lowerColor = color.toLowerCase();

  if (lowerColor.includes("đen")) return { backgroundColor: "#000000" };
  if (lowerColor.includes("hồng")) return { backgroundColor: "#f9c5d1" };
  if (lowerColor.includes("trắng")) return { backgroundColor: "#ffffff" };
  if (lowerColor.includes("xám")) return { backgroundColor: "#808080" };
  if (lowerColor.includes("xanh dương kẻ sọc")) return { backgroundColor: "#1e90ff" };
  if (lowerColor.includes("xanh họa tiết")) return { backgroundColor: "#87ceeb" };
  if (lowerColor.includes("trắng họa tiết")) return { backgroundColor: "#f5f5f5" };
  if (lowerColor.includes("vàng kẻ sọc")) return { backgroundColor: "#ffeb3b" };
  if (lowerColor.includes("xanh dương")) return { backgroundColor: "#1e90ff" };
  if (lowerColor.includes("be kẻ sọc")) return { backgroundColor: "#f5f5dc" };
  if (lowerColor.includes("tím")) return { backgroundColor: "#dda0dd" };
  if (lowerColor.includes("đỏ")) return { backgroundColor: "#ff0000" };
  if (lowerColor.includes("vàng")) return { backgroundColor: "#ffd700" };

  return { backgroundColor: "#cccccc" };
};
