"use client";

import { useEffect, useState, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
  PawPrint,
  Search,
  X,
} from "lucide-react";

import { Avatar, Badge } from "./ui";
import { cn } from "./utils";

export interface NavigationItem {
  /** Stable identity for items that intentionally share a destination. */
  id?: string;
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string | number;
  disabled?: boolean;
  exact?: boolean;
}

export interface AppUser {
  name: string;
  email?: string;
  imageUrl?: string | null;
  roleLabel?: string;
  profileHref?: string;
}

export interface SidebarProps {
  items: NavigationItem[];
  footerItems?: NavigationItem[];
  activeHref?: string;
  collapsed?: boolean;
  onNavigate?: () => void;
  className?: string;
  showBrand?: boolean;
}

function isActiveItem(item: NavigationItem, activeHref?: string) {
  if (!activeHref) return false;
  if (item.exact) return activeHref === item.href;
  return activeHref === item.href || (item.href !== "/" && activeHref.startsWith(`${item.href}/`));
}

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <a href="/dashboard" className="flex items-center gap-3 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500">
      <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-[#0b6b62] to-[#2b9c8f] text-white shadow-[0_12px_24px_-14px_rgba(8,86,78,.8)]">
        <PawPrint className="h-5 w-5" aria-hidden="true" />
      </span>
      {!compact ? (
        <span className="min-w-0 leading-tight">
          <span className="block text-base font-extrabold tracking-tight text-[#163a3b]">PetCare Hub</span>
          <span className="block text-[11px] font-medium text-slate-500">Care, made connected</span>
        </span>
      ) : null}
    </a>
  );
}

function NavigationList({
  items,
  activeHref,
  collapsed,
  onNavigate,
}: Pick<SidebarProps, "items" | "activeHref" | "collapsed" | "onNavigate">) {
  return (
    <nav aria-label="Primary navigation" className="space-y-1">
      {items.map((item) => {
        const Icon = item.icon;
        const active = isActiveItem(item, activeHref);

        if (item.disabled) {
          return (
            <span
              key={item.id ?? `${item.label}-${item.href}`}
              className={cn(
                "flex h-11 cursor-not-allowed items-center gap-3 rounded-xl px-3 text-sm font-medium text-slate-400",
                collapsed && "justify-center px-0",
              )}
              aria-disabled="true"
              title={collapsed ? item.label : undefined}
            >
              <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
              {!collapsed ? <span className="truncate">{item.label}</span> : null}
            </span>
          );
        }

        return (
          <a
            key={item.id ?? `${item.label}-${item.href}`}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            title={collapsed ? item.label : undefined}
            className={cn(
              "group flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500",
              active
                ? "bg-[#e6f5f1] text-[#075e56] shadow-[inset_0_0_0_1px_rgba(14,107,98,.06)]"
                : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-950",
              collapsed && "justify-center px-0",
            )}
          >
            <Icon
              className={cn("h-5 w-5 shrink-0 transition-colors", active ? "text-[#0b6b62]" : "text-slate-400 group-hover:text-[#0b6b62]")}
              aria-hidden="true"
            />
            {!collapsed ? <span className="min-w-0 flex-1 truncate">{item.label}</span> : null}
            {!collapsed && item.badge !== undefined ? (
              <Badge tone={active ? "teal" : "slate"} className="min-w-5 justify-center px-1.5 py-0.5 text-[10px]">
                {item.badge}
              </Badge>
            ) : null}
          </a>
        );
      })}
    </nav>
  );
}

export function Sidebar({
  items,
  footerItems,
  activeHref,
  collapsed = false,
  onNavigate,
  className,
  showBrand = true,
}: SidebarProps) {
  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-slate-200/80 bg-white/90 px-3 py-5 backdrop-blur-xl",
        collapsed ? "w-24" : "w-72",
        className,
      )}
    >
      {showBrand ? <div className={cn("mb-8 px-2", collapsed && "flex justify-center px-0")}><Brand compact={collapsed} /></div> : null}
      <div className="min-h-0 flex-1 overflow-y-auto px-1">
        <NavigationList items={items} activeHref={activeHref} collapsed={collapsed} onNavigate={onNavigate} />
      </div>
      {footerItems?.length ? (
        <div className="mt-5 border-t border-slate-100 px-1 pt-4">
          <NavigationList items={footerItems} activeHref={activeHref} collapsed={collapsed} onNavigate={onNavigate} />
        </div>
      ) : null}
    </aside>
  );
}

export interface TopbarProps {
  title?: string;
  subtitle?: string;
  user?: AppUser;
  onMenuClick?: () => void;
  onNotificationClick?: () => void;
  notificationCount?: number;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  actions?: ReactNode;
  onSignOut?: () => void;
  className?: string;
}

export function Topbar({
  title,
  subtitle,
  user,
  onMenuClick,
  onNotificationClick,
  notificationCount,
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search pets, care, orders…",
  actions,
  onSignOut,
  className,
}: TopbarProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex min-h-16 items-center gap-3 border-b border-slate-200/80 bg-[#f8f8f4]/88 px-4 backdrop-blur-xl md:min-h-[72px] md:px-7",
        className,
      )}
    >
      {onMenuClick ? (
        <button
          type="button"
          onClick={onMenuClick}
          className="grid h-10 w-10 place-items-center rounded-xl text-slate-600 hover:bg-white hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 lg:hidden"
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>
      ) : null}

      <div className="min-w-0 flex-1">
        {title ? <h1 className="truncate text-lg font-bold tracking-tight text-slate-900 md:text-xl">{title}</h1> : null}
        {subtitle ? <p className="hidden truncate text-sm text-slate-500 sm:block">{subtitle}</p> : null}
      </div>

      {onSearchChange ? (
        <label className="relative hidden w-full max-w-xs md:block">
          <span className="sr-only">Search</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input
            value={searchValue ?? ""}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={searchPlaceholder}
            className="h-10 w-full rounded-xl border border-slate-200 bg-white/90 pl-9 pr-3 text-sm text-slate-800 shadow-sm outline-none placeholder:text-slate-400 transition hover:border-slate-300 focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
          />
        </label>
      ) : null}

      <div className="flex items-center gap-1.5 sm:gap-2">
        {actions}
        {onNotificationClick ? (
          <button
            type="button"
            onClick={onNotificationClick}
            className="relative grid h-10 w-10 place-items-center rounded-xl text-slate-500 transition hover:bg-white hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
            aria-label={notificationCount ? `${notificationCount} unread notifications` : "Notifications"}
          >
            <Bell className="h-5 w-5" aria-hidden="true" />
            {notificationCount ? (
              <span className="absolute right-1.5 top-1.5 grid min-h-4 min-w-4 place-items-center rounded-full bg-orange-500 px-1 text-[9px] font-bold text-white ring-2 ring-slate-50">
                {notificationCount > 9 ? "9+" : notificationCount}
              </span>
            ) : null}
          </button>
        ) : null}
        {user ? (
          <div className="ml-1 flex items-center gap-2 border-l border-slate-200 pl-2 sm:ml-2 sm:pl-3">
            <a
              href={user.profileHref ?? "/profile"}
              className="flex min-w-0 items-center gap-2 rounded-xl p-1 transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
              aria-label="Open profile"
            >
              <Avatar src={user.imageUrl} name={user.name} size="sm" />
              <span className="hidden min-w-0 md:block">
                <span className="block max-w-28 truncate text-sm font-semibold text-slate-800">{user.name}</span>
                {user.roleLabel ? <span className="block max-w-28 truncate text-xs text-slate-500">{user.roleLabel}</span> : null}
              </span>
            </a>
            {onSignOut ? (
              <button
                type="button"
                onClick={onSignOut}
                className="hidden h-9 w-9 place-items-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 lg:grid"
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </header>
  );
}

export interface AppShellProps {
  children: ReactNode;
  navigation: NavigationItem[];
  footerNavigation?: NavigationItem[];
  activeHref?: string;
  user?: AppUser;
  title?: string;
  subtitle?: string;
  headerActions?: ReactNode;
  onNotificationClick?: () => void;
  notificationCount?: number;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onSignOut?: () => void;
  contentClassName?: string;
}

/**
 * Responsive dashboard frame. It owns the mobile drawer and desktop sidebar state,
 * while routes stay responsible for data, navigation state, and actual actions.
 */
export function AppShell({
  children,
  navigation,
  footerNavigation,
  activeHref,
  user,
  title,
  subtitle,
  headerActions,
  onNotificationClick,
  notificationCount,
  searchValue,
  onSearchChange,
  onSignOut,
  contentClassName,
}: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (!mobileOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [mobileOpen]);

  return (
    <div className="min-h-screen bg-[#f8f8f4] text-slate-900">
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden border-r border-slate-200/80 bg-white/90 transition-[width] duration-200 lg:block",
          collapsed ? "w-24" : "w-72",
        )}
      >
        <Sidebar
          items={navigation}
          footerItems={footerNavigation}
          activeHref={activeHref}
          collapsed={collapsed}
          className="w-full border-0"
        />
        <button
          type="button"
          onClick={() => setCollapsed((current) => !current)}
          className="absolute -right-3 top-8 grid h-6 w-6 place-items-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:text-teal-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        </button>
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation menu">
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 cursor-default bg-slate-950/40 backdrop-blur-[1px]"
            aria-label="Close navigation"
          />
          <div className="relative h-full w-[min(19rem,88vw)] bg-white shadow-2xl">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-4 grid h-9 w-9 place-items-center rounded-xl text-slate-500 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
              aria-label="Close navigation"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
            <Sidebar
              items={navigation}
              footerItems={footerNavigation}
              activeHref={activeHref}
              onNavigate={() => setMobileOpen(false)}
              className="w-full border-0"
            />
          </div>
        </div>
      ) : null}

      <main className={cn("relative min-h-screen transition-[padding] duration-200", collapsed ? "lg:pl-24" : "lg:pl-72")}>
        <Topbar
          title={title}
          subtitle={subtitle}
          user={user}
          onMenuClick={() => setMobileOpen(true)}
          onNotificationClick={onNotificationClick}
          notificationCount={notificationCount}
          searchValue={searchValue}
          onSearchChange={onSearchChange}
          actions={headerActions}
          onSignOut={onSignOut}
        />
        <div className={cn("relative z-10 mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-8", contentClassName)}>{children}</div>
      </main>
    </div>
  );
}
