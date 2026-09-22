import { Calendar, Info, UserMinus, UserPlus } from "lucide-react";
import type { SystemMessageType } from "../types";

export type { SystemMessageType };

export interface SystemMessageProps {
  type: SystemMessageType;
  text: string;
}

const icons: Record<SystemMessageType, typeof Info> = {
  consultation_started: Calendar,
  consultation_ended: Info,
  user_joined: UserPlus,
  user_left: UserMinus,
};

export function SystemMessage({ type, text }: SystemMessageProps) {
  const Icon = icons[type];
  return (
    <div className="mx-auto flex w-fit items-center gap-2 rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300" role="status" data-testid="system-message">
      <Icon className="h-3 w-3" aria-hidden="true" />
      <span>{text}</span>
    </div>
  );
}
