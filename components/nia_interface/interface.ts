 interface ContentProps {
   role: "user" | "model";
   parts: string[];
 };

interface MessageHistoryProps {
  contents: ContentProps[];
};
