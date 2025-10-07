"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Dashboard" },
    { href: "/reports", label: "Reports" },
    { href: "/scenarios", label: "Saved Scenarios" },
    { href: "/settings", label: "Settings" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-semibold text-gray-900 tracking-tight hover:text-gray-700 transition-colors">
            Synduct Signals
          </Link>
          <nav className="flex items-center space-x-8">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm transition-colors ${
                    isActive
                      ? "font-medium text-blue-600 border-b-2 border-blue-600 pb-1"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}