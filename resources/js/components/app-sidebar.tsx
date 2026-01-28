import { Link } from '@inertiajs/react';
import { 
    BookOpen, 
    Folder, 
    LayoutGrid, 
    Wrench,
    Wallet,
    Tag,
    Receipt,
    Repeat,
    CreditCard,
    Bell,
    PieChart
} from 'lucide-react';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Finance',
        icon: PieChart,
        items: [
            {
                title: 'Overview',
                href: '/finance/dashboard',
            },
            {
                title: 'Wallets',
                href: '/wallets',
            },
            {
                title: 'Categories',
                href: '/categories',
            },
            {
                title: 'Transactions',
                href: '/transactions',
            },
            {
                title: 'Subscriptions',
                href: '/subscriptions',
            },
            {
                title: 'Installments',
                href: '/installments',
            },
        ],
    },
    {
        title: 'Notifications',
        href: '/notifications',
        icon: Bell,
    },
    {
        title: 'Tools',
        icon: Wrench,
        items: [
            {
                title: 'Encoder/Decoder',
                href: '/tools/encoder-decoder',
            },
        ],
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
