export interface ContentProps {
   role: "user" | "model";
   parts: { text: string }[];
 };

export interface MessageHistoryProps {
  contents: ContentProps[];
};

export interface NewMessageProps extends MessageHistoryProps {
  loading: boolean;
}
