"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    FileText,
    Settings,
    LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
    { href: "/admin", label: "ダッシュボード", icon: LayoutDashboard },
    { href: "/admin/groups", label: "グループ管理", icon: Users },
    { href: "/admin/submissions", label: "同意履歴", icon: FileText },
    { href: "/admin/plans", label: "プラン設定", icon: Settings },
];

export function AdminSidebar() {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = async () => {
        await fetch('/api/admin/logout', { method: 'POST' });
        router.push('/admin/login');
        router.refresh();
    };

    return (
        <div className="w-64 h-screen flex flex-col border-r bg-slate-50">
            {/* Brand */}
            <div className="h-16 flex items-center px-6 border-b bg-white">
                <span className="font-bold text-xl tracking-tight text-slate-900">ASPFORM</span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-4 px-3 space-y-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link key={item.href} href={item.href}>
                            <div
                                className={cn(
                                    "flex items-center px-3 py-3 rounded-md text-base font-medium transition-colors",
                                    isActive
                                        ? "bg-slate-900 text-white"
                                        : "text-slate-700 hover:bg-slate-200"
                                )}
                            >
                                <item.icon className={cn("h-5 w-5 mr-3", isActive ? "text-white" : "text-slate-500")} />
                                {item.label}
                            </div>
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t bg-white">
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
    );
}
