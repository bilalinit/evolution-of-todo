/**
 * NotificationPanel Component
 * Modern Technical Editorial Design System
 * Dropdown panel with bell icon and notifications list
 */

import * as React from 'react';
import { useRef } from 'react';
import { Bell, X, CheckCheck } from 'lucide-react';
import { NotificationItem } from './NotificationItem';

export interface Notification {
  id: string;
  user_id: string;
  message: string;
  read: boolean;
  created_at: string;
  task_id?: string;
}

interface NotificationPanelProps {
  notifications: Notification[];
  unreadCount: number;
  onMarkRead: (notificationId: string) => void;
  onMarkAllRead?: () => void;
  onDelete?: (notificationId: string) => void;
  isLoading?: boolean;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  notifications,
  unreadCount,
  onMarkRead,
  onMarkAllRead,
  onDelete,
  isLoading = false
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const panelRef = React.useRef<HTMLDivElement>(null);

  // Close panel when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div ref={panelRef} className="relative">
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-[#2A1B12]/10 rounded-md transition-colors"
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
      >
        <Bell className="w-5 h-5 text-[#2A1B12]" strokeWidth={1.5} />

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center px-1 bg-[#FF6B4A] text-white font-mono text-[10px] font-bold rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="fixed sm:absolute inset-x-0 sm:inset-x-auto top-14 sm:top-auto right-0 sm:right-0 sm:mt-2 mx-2 sm:mx-0 sm:w-80 max-h-[70vh] sm:max-h-[400px] bg-[#F9F7F2] border border-[#2A1B12]/20 rounded-lg shadow-lg overflow-hidden z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[#2A1B12]/10">
            <h3 className="font-serif font-bold text-[#2A1B12] text-sm">
              Notifications
            </h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && onMarkAllRead && (
                <button
                  onClick={onMarkAllRead}
                  className="flex items-center gap-1 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-[#FF6B4A] hover:bg-[#FF6B4A]/10 rounded-md transition-colors"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-3 h-3" />
                  Mark all
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-[#2A1B12]/10 rounded-md transition-colors"
                aria-label="Close notifications"
              >
                <X className="w-4 h-4 text-[#5C4D45]" strokeWidth={1.5} />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto max-h-[320px]">
            {isLoading ? (
              <div className="p-8 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-[#FF6B4A] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 text-[#2A1B12]/20 mx-auto mb-3" strokeWidth={1.5} />
                <p className="font-sans text-sm text-[#5C4D45]">No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkRead={onMarkRead}
                  onDelete={onDelete}
                />
              ))
            )}
          </div>

          {/* Footer with unread count */}
          {notifications.length > 0 && (
            <div className="p-2 border-t border-[#2A1B12]/10 bg-[#2A1B12]/5">
              <p className="font-mono text-[10px] text-center text-[#5C4D45] uppercase tracking-wider">
                {unreadCount} unread{unreadCount !== 1 ? '' : ''} of {notifications.length} total
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
