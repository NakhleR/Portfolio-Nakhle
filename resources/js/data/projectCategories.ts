/** Display labels only: imported category values stay untouched in MySQL. */
export function projectCategoryLabel(value: string): string {
    const key = value.trim().toLowerCase();
    if (key === "game development") return "Game development";
    if (key === "web development") return "Web development";
    if (key === "mobile application") return "Mobile apps";
    if (key.includes("machine learning")) return "AI & machine learning";
    return value;
}
