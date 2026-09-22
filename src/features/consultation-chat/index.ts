export {
  ConsultationChat,
  default,
  type ConsultationChatHandle,
  type ConsultationChatProps,
} from "./components";
export type {
  ChatUser,
  ClientEvent,
  Consultation,
  ConsultationStatus,
  Message,
  MessageStatus,
  MessageType,
  ParticipantType,
  ServerEvent,
  TypingUser,
} from "./types";
export { useConsultationChat } from "./hooks/useConsultationChat";
export { useMessages } from "./hooks/useMessages";
export { useTypingIndicator } from "./hooks/useTypingIndicator";
export { useUnreadCount } from "./hooks/useUnreadCount";
export { useWebSocket } from "./hooks/useWebSocket";
export { chatQueryKeys, fetchMessages, fetchUnreadCount } from "./services/chatApi";
export {
  createSocketUrl,
  createWebSocketClient,
  WebSocketClient,
  type WebSocketConnectionStatus,
} from "./services/websocket";
