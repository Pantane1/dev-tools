export type ToolCategory = "Developer" | "Security" | "Networking" | "Data";

export interface ToolMeta {
  slug: string;
  name: string;
  description: string;
  category: ToolCategory;
  keywords: string[];
  /** Phase this tool ships in — only "live" tools are linked/clickable today. */
  status: "live" | "coming-soon";
}
