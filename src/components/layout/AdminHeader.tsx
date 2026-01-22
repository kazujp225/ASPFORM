"use client";

export function AdminHeader() {
    return (
        <header className="h-14 bg-white border-b flex items-center justify-between px-6 sticky top-0 z-10">
            <div />
            <div className="flex items-center gap-4">
                <span className="text-sm text-slate-500">管理者</span>
                <div className="h-9 w-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-medium text-base">
                    A
                </div>
            </div>
        </header>
    );
}
