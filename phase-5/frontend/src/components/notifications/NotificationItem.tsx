/**
 * NotificationItem Component
 * Modern Technical Editorial Design System
 * Displays a single notification with mark-as-read action
 */

import * as React from 'react';
import { Bell, Check, X } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils/date';

export interface Notification {
  id: string;
  user_id: string;
  message: string;
  read: boolean;
  created_at: string;
  task_id?: string;
}

interface NotificationItemProps {
  notification: Notification;
  onMarkRead: (notificationId: string) => void;
  onDelete?: (notificationId: string) => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkRead,
  onDelete
}) => {
  return (
    <div
      className={`
        relative p-3 border-b border-[#2A1B12]/10 last:border-b-0
        transition-all duration-200
        ${notification.read ? 'opacity-60 bg-[#F9F7F2]/50' : 'bg-[#F9F7F2]'}
        hover:bg-[#2A1B12]/5
      `}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`
          flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
          ${notification.read ? 'bg-[#2A1B12]/10' : 'bg-[#FF6B4A]/10'}
        `}>
          <Bell className={`
            w-4 h-4
            ${notification.read ? 'text-[#5C4D45]' : 'text-[#FF6B4A]'}
          `} strokeWidth={1.5} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className={`
            font-sans text-xs leading-snug mb-1 line-clamp-2
            ${notification.read ? 'text-[#5C4D45]' : 'text-[#2A1B12] font-medium'}
          `}>
            {notification.message}
          </p>
          <p className="font-mono text-[9px] text-[#5C4D45]/70">
            {formatRelativeTime(notification.created_at)}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {!notification.read && (
            <button
              onClick={() => onMarkRead(notification.id)}
              className="p-1.5 hover:bg-[#2A1B12]/10 rounded-md transition-colors"
              aria-label="Mark as read"
              title="Mark as read"
            >
              <Check className="w-4 h-4 text-[#5C4D45]" strokeWidth={1.5} />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(notification.id)}
              className="p-1.5 hover:bg-red-100 rounded-md transition-colors"
              aria-label="Delete notification"
              title="Delete"
            >
              <X className="w-4 h-4 text-red-600" strokeWidth={1.5} />
            </button>
          )}
        </div>
      </div>

      {/* Unread indicator */}
      {!notification.read && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#FF6B4A] rounded-r-full" />
      )}
    </div>
  );
};
