declare const brandedId: unique symbol;

export interface Brand<B extends string> {
  readonly [brandedId]: B;
}

export type ConsultationId = number & Brand<"ConsultationId">;
export type MessageId = string & Brand<"MessageId">;
export type UserId = (string | number) & Brand<"UserId">;

export function asConsultationId(value: number): ConsultationId {
  return value as ConsultationId;
}

export function asMessageId(value: string): MessageId {
  return value as MessageId;
}

export function asUserId(value: string | number): UserId {
  return value as UserId;
}

export type ParticipantType = "customer" | "psychic";

export type MessageType = "text" | "image" | "file" | "system";

export type MessageStatus =
  | "sending"
  | "sent"
  | "delivered"
  | "read"
  | "failed";

export interface Message {
  id: MessageId;
  consultationId: ConsultationId;
  senderId: UserId;
  senderName: string;
  participantType: ParticipantType;
  content: string;
  type: MessageType;
  status: MessageStatus;
  createdAt: string;
  deliveredAt?: string;
  readAt?: string;
  tempId?: string;
  isOwn?: boolean;
}

export type ConsultationStatus = "active" | "completed" | "canceled";

export interface Consultation {
  id: ConsultationId;
  bookingId: string;
  psychicId: UserId;
  customerId: UserId;
  psychicName: string;
  customerName: string;
  startTime: string;
  endTime?: string;
  duration: number;
  rate: number;
  totalPrice: number;
  costLog: Array<{ at: string; duration: number; cost: number }>;
  status: ConsultationStatus;
}

export interface ChatUser {
  id: string | number;
  name: string;
  email?: string;
  role?: ParticipantType | "admin";
  profileImage?: string;
}

export interface TypingUser {
  userId: string | number;
  name: string;
  participantType: ParticipantType;
}

export type ClientMessageType = Extract<MessageType, "text" | "image" | "file">;

export interface ClientMessageEvent {
  type: "message";
  content: string;
  messageType?: ClientMessageType;
  tempId?: string;
}

export interface ClientTypingEvent {
  type: "typing";
  isTyping: boolean;
}

export interface ClientReadEvent {
  type: "read";
}

export interface ClientPingEvent {
  type: "ping";
}

export type ClientEvent =
  | ClientMessageEvent
  | ClientTypingEvent
  | ClientReadEvent
  | ClientPingEvent;

export interface ConnectedServerEvent {
  type: "connected";
  consultationId: ConsultationId;
}

export interface MessageServerEvent {
  type: "message";
  data: Message;
}

export interface TypingServerEventData {
  userId: UserId;
  userName: string;
  participantType: ParticipantType;
  isTyping: boolean;
}

export interface TypingServerEvent {
  type: "typing";
  data: TypingServerEventData;
}

export interface ReadServerEventData {
  userId: UserId;
  participantType: ParticipantType;
}

export interface ReadServerEvent {
  type: "read";
  data: ReadServerEventData;
}

export interface PongServerEvent {
  type: "pong";
}

export interface ConsultationEndedServerEvent {
  type: "consultation_ended";
  data: { consultationId: ConsultationId };
}

export interface ErrorServerEvent {
  type: "error";
  message: string;
}

export type ServerEvent =
  | ConnectedServerEvent
  | MessageServerEvent
  | TypingServerEvent
  | ReadServerEvent
  | PongServerEvent
  | ConsultationEndedServerEvent
  | ErrorServerEvent;

export type SystemMessageType =
  | "consultation_started"
  | "consultation_ended"
  | "user_joined"
  | "user_left";

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export type MessagesApiResponse = ApiSuccess<Message[] | { messages: Message[] }>;

export interface UnreadCountData {
  unread_count: number;
}

export type UnreadCountApiResponse = ApiSuccess<UnreadCountData>;
