
import { ChevronLeft, Menu, LogOut } from "lucide-react";
import { Link } from "@tanstack/react-router";
import ThemeSwitcher from "./ThemeSwitcher";


interface NavItem {
    href?: string;
    label: string;
    icon?: React.ElementType;
    type?: "divider";
    isTitle?: boolean;
}

interface SidebarProps {
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
    filteredNavItems: NavItem[];
}

export default function Sidebar({ sidebarOpen, setSidebarOpen, filteredNavItems }: SidebarProps) {
    return (
        <aside
            className={`bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm transition-all duration-300 ease-in-out ${sidebarOpen ? "w-64" : "w-20"
                }`}
        >
            <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between p-4 h-16 border-b border-gray-200 dark:border-slate-700">
                    <span
                        className={`font-bold text-xl text-indigo-600 dark:text-indigo-400 ${!sidebarOpen ? "hidden" : ""
                            }`}
                    >
                        اکوسیستم
                    </span>
                    <div className="flex items-center gap-x-2">
                        <ThemeSwitcher />
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                        >
                            {sidebarOpen ? <ChevronLeft /> : <Menu />}
                        </button>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
                    {filteredNavItems.map((item, index) => {
                        if (item.type === "divider") {
                            return <hr key={index} className="my-2 border-gray-200 dark:border-slate-700" />;
                        }

                        if (item.isTitle) {
                            return (
                                <h3
                                    key={index}
                                    className={`px-4 pt-4 pb-2 text-xs font-bold text-gray-500 uppercase ${!sidebarOpen ? "hidden" : ""
                                        }`}
                                >
                                    {item.label}
                                </h3>
                            );
                        }

                        if (item.href && item.icon) {
                            const IconComponent = item.icon;
                            return (

                                <Link
                                    key={item.href}
                                    to={item.href || '/'} // دقت کن باید `to` باشه، نه href
                                    className="flex items-center p-3 rounded-lg text-gray-600 dark:text-gray-300 hover:text-white hover:bg-indigo-500 dark:hover:bg-indigo-600 transition-colors"
                                >
                                    <IconComponent className="h-6 w-6" />
                                    {sidebarOpen && (
                                        <span className="mr-4 font-medium">
                                            {item.label}
                                        </span>
                                    )}
                                </Link>

                            );
                        }

                        return null;
                    })}
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200 dark:border-slate-700">
                    <Link
                        to="/logout"
                        className="flex items-center p-3 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-red-100 dark:hover:bg-red-800/50 hover:text-red-700 dark:hover:text-white transition-colors"
                    >
                        <LogOut className="h-6 w-6" />
                        <span className={`mr-4 font-medium ${!sidebarOpen ? "hidden" : ""}`}>خروج</span>
                    </Link>
                </div>
            </div>
        </aside>
    );
}
