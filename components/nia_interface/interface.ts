export interface ContentProps {
   role: "user" | "model";
   parts: { text: string }[];
 };

export interface MessageHistoryProps {
  contents: ContentProps[];
};
