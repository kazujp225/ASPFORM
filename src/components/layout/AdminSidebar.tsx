"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    FileText,
    Settings,
    LogOut,
    X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
    { href: "/admin", label: "ダッシュボード", icon: LayoutDashboard },
    { href: "/admin/groups", label: "グループ管理", icon: Users },
    { href: "/admin/submissions", label: "同意履歴", icon: FileText },
    { href: "/admin/plans", label: "プラン設定", icon: Settings },
];

interface AdminSidebarProps {
    open?: boolean;
    onClose?: () => void;
}

export function AdminSidebar({ open, onClose }: AdminSidebarProps) {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = async () => {
        await fetch('/api/admin/logout', { method: 'POST' });
        router.push('/admin/login');
        router.refresh();
    };

    const handleNavClick = () => {
        onClose?.();
    };

    return (
        <>
            {/* Mobile overlay backdrop */}
            {open && (
                <div
                    className="fixed inset-0 bg-black/40 z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <div
                className={cn(
                    "fixed top-0 left-0 h-screen w-64 flex flex-col border-r bg-slate-50 z-50 transition-transform duration-200 ease-in-out",
                    "lg:translate-x-0 lg:static lg:z-auto",
                    open ? "translate-x-0" : "-translate-x-full"
                )}
            >
                {/* Brand */}
                <div className="h-14 flex items-center justify-between px-6 border-b bg-white shrink-0">
                    <span className="font-bold text-xl tracking-tight text-slate-900">ASPFORM</span>
                    <button
                        onClick={onClose}
                        className="lg:hidden p-1 rounded hover:bg-slate-100"
                    >
                        <X className="h-5 w-5 text-slate-500" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link key={item.href} href={item.href} onClick={handleNavClick}>
                                <div
                                    className={cn(
                                        "flex items-center px-3 py-3 rounded-md text-base font-medium transition-colors",
                                        isActive
                                            ? "bg-slate-900 text-white"
                                            : "text-slate-700 hover:bg-slate-200"
                                    )}
                                >
                                    <item.icon className={cn("h-5 w-5 mr-3 shrink-0", isActive ? "text-white" : "text-slate-500")} />
                                    {item.label}
                                </div>
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="p-4 border-t bg-white shrink-0">
                    <Button
                        variant="ghost"
                        onClick={handleLogout}
                        className="w-full justify-start text-base text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    >
                        <LogOut className="h-5 w-5 mr-3" />
                        ログアウト
                    </Button>
                </div>
            </div>
        </>
    );
}
