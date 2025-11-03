'use client';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', icon: '🏠', label: 'Dashboard' },
    { id: 'chart', icon: '📊', label: 'Chart' },
    { id: 'settings', icon: '⚙️', label: 'Settings' },
    { id: 'notifications', icon: '🔔', label: 'Notifications' },
  ];

  return (
    <div className="w-20 bg-[#1a1a1a] flex flex-col items-center py-8 gap-8">
      {menuItems.map((item) => (
        <button
          key={item.id}
          onClick={() => onTabChange(item.id)}
          className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-smooth ${
            activeTab === item.id
              ? 'bg-[#10b981] text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
          title={item.label}
        >
          {item.icon}
        </button>
      ))}
      <div className="mt-auto">
        <button
          className="w-12 h-12 rounded-full flex items-center justify-center text-2xl text-red-400 hover:text-red-300 hover:bg-gray-800 transition-smooth"
          title="Logout"
        >
          🚪
        </button>
      </div>
    </div>
  );
}

