import { Link } from "@tanstack/react-router";

   <aside className={`bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm transition-all duration-300 ease-in-out ${sidebarOpen ? 'w-64' : 'w-20'}`} >
                <div className="flex flex-col h-full">
                    <div className={`flex items-center justify-between p-4 h-16 border-b border-gray-200 dark:border-slate-700`}>
                        <span className={`font-bold text-xl text-indigo-600 dark:text-indigo-400 ${!sidebarOpen && 'hidden'}`}>اکوسیستم</span>
                        <div className="flex items-center gap-x-2">
                            <ThemeSwitcher />
                            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700">
                                {sidebarOpen ? <ChevronLeft /> : <Menu />}
                            </button>
                        </div>
                    </div>
                    <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
                        {filteredNavItems.map((item, index) =>
                            item.type === 'divider' ? (<hr key={index} className="my-2 border-gray-200 dark:border-slate-700" />)
                                : item.isTitle ? (<h3 key={index} className={`px-4 pt-4 pb-2 text-xs font-bold text-gray-500 uppercase ${!sidebarOpen && 'hidden'}`}>{item.label}</h3>)
                                    : (
                                        <Link key={item.href} href={item.href || '#'}
                                            className="flex items-center p-3 rounded-lg text-gray-600 dark:text-gray-300 hover:text-white hover:bg-indigo-500 dark:hover:bg-indigo-600 transition-colors">
                                            <item.icon className="h-6 w-6" />
                                            <span className={`mr-4 font-medium ${!sidebarOpen && 'hidden'}`}>{item.label}</span>
                                        </Link>
                                    )
                        )}
                    </nav>
                    <div className="p-4 border-t border-gray-200 dark:border-slate-700">
                        <Link href="/logout" className="flex items-center p-3 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-red-100 dark:hover:bg-red-800/50 hover:text-red-700 dark:hover:text-white transition-colors">
                            <LogOut className="h-6 w-6" />
                            <span className={`mr-4 font-medium ${!sidebarOpen && 'hidden'}`}>خروج</span>
                        </Link>
                    </div>
                </div>
            </aside>