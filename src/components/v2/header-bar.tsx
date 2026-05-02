import { Watch } from 'lucide-react';

interface HeaderBarProps {
  avatarUrl?: string | null;
  initials?: string;
  notificationCount?: number;
  deviceName?: string;
  deviceStatus?: string;
}

export function HeaderBar({
  avatarUrl,
  initials = 'BC',
  notificationCount = 0,
  deviceName = 'BodyCoach',
  deviceStatus,
}: HeaderBarProps) {
  return (
    <div className="flex items-center justify-between px-5 pt-5">
      <div className="relative">
        <div className="h-12 w-12 overflow-hidden rounded-full bg-gradient-to-br from-[#FFB8A0] to-[#A8B7FF] ring-2 ring-white/70 shadow-md">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[15px] font-semibold text-white">
              {initials}
            </div>
          )}
        </div>
        {notificationCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-[11px] font-semibold text-[#1d1d1f] shadow">
            {notificationCount}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 rounded-full bg-white/70 px-3 py-1.5 shadow-sm backdrop-blur-md">
        <div className="text-right leading-tight">
          <div className="text-[13px] font-semibold text-[#1d1d1f]">{deviceName}</div>
          {deviceStatus && (
            <div className="text-[11px] text-[#6e6e73]">{deviceStatus}</div>
          )}
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-inner">
          <Watch className="h-4 w-4 text-[#6e6e73]" />
        </div>
      </div>
    </div>
  );
}
