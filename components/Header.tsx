'use client';

interface HeaderProps {
  userName?: string;
}

export function Header({ userName = 'User' }: HeaderProps) {
  return (
    <div className="h-16 bg-[#1a1a1a] flex items-center justify-between px-8 border-b border-gray-800">
      <div className="text-2xl font-bold text-white">Ældern Debts</div>
      
      <div className="flex-1 max-w-md mx-8">
        <div className="relative">
          <input
            type="text"
            placeholder="Search bar"
            className="w-full bg-[#252525] border border-gray-700 rounded-lg px-4 py-2 pl-10 text-gray-300 placeholder-gray-500 focus:outline-none focus:border-[#10b981] transition-smooth"
          />
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">🔍</span>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <span className="text-gray-300">Hi {userName}!</span>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#10b981] to-[#14b8a6] flex items-center justify-center text-white font-semibold">
          {userName.charAt(0).toUpperCase()}
        </div>
      </div>
    </div>
  );
}

