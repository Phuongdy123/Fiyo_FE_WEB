export const getColorStyle = (color?: string) => {
  const DEFAULT_STYLE = { backgroundColor: "#cccccc" };
  
  if (!color) return DEFAULT_STYLE;

  const lowerColor = color.toLowerCase();

  // 1. Định nghĩa bảng màu (Mapping)
  // Thứ tự ưu tiên: Các chuỗi dài/chi tiết hơn nên được kiểm tra trước
  const colorMap: Record<string, string> = {
    "xanh dương kẻ sọc": "#1e90ff",
    "xanh họa tiết": "#87ceeb",
    "trắng họa tiết": "#f5f5f5",
    "vàng kẻ sọc": "#ffeb3b",
    "be kẻ sọc": "#f5f5dc",
    "xanh dương": "#1e90ff",
    "đen": "#000000",
    "hồng": "#f9c5d1",
    "trắng": "#ffffff",
    "xám": "#808080",
    "tím": "#dda0dd",
    "đỏ": "#ff0000",
    "vàng": "#ffd700",
    "cam": "#9c420aff",
  };

  // 2. Tìm kiếm màu phù hợp
  // Sử dụng find để lấy key đầu tiên khớp với chuỗi đầu vào
  const matchedKey = Object.keys(colorMap).find(key => lowerColor.includes(key));

  return matchedKey 
    ? { backgroundColor: colorMap[matchedKey] } 
    : DEFAULT_STYLE;
};