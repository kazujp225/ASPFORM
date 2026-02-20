"use client";

import { Menu } from "lucide-react";

interface AdminHeaderProps {
    onMenuClick?: () => void;
}

export function AdminHeader({ onMenuClick }: AdminHeaderProps) {
    return (
        <header className="h-14 bg-white border-b flex items-center justify-between px-4 sm:px-6 sticky top-0 z-10">
            <button
                onClick={onMenuClick}
                className="lg:hidden p-2 -ml-2 rounded hover:bg-slate-100"
            >
                <Menu className="h-5 w-5 text-slate-700" />
            </button>
            <div className="hidden lg:block" />
            <div className="flex items-center gap-3">
                <span className="text-sm text-slate-500">管理者</span>
                <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-medium text-sm">
                    A
                </div>
            </div>
        </header>
    );
}
