export type TimelineItem = {
  year: string;
  title: string;
  company: string;
  description: string;
  status: "past" | "current" | "next";
};
