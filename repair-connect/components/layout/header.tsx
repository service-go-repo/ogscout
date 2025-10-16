'use client';

/**
 * Header Component - Fully SEO-Optimized with Navigation Schema
 * Features: Mobile menu, Framer Motion animations, auth-based navigation
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  X,
  Wrench,
  Car,
  Paintbrush,
  Zap,
  Disc,
  Settings,
  ChevronDown,
  MapPin,
  User,
  LogOut,
  LayoutDashboard,
  FileText,
  Building2,
  MessageSquare,
  DollarSign,
  Clock,
  CheckCircle,
  Users,
  Plus,
  Calendar,
  Search,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { generateSiteNavigationSchema, SERVICE_CATEGORIES } from '@/lib/seo';
import { StructuredData } from '@/components/seo/StructuredData';
import { APP_NAME } from '@/lib/constants';
import { useProfileCompletion } from '@/hooks/useProfileCompletion';

const publicNavItems = [
  { name: 'Home', url: '/', icon: LayoutDashboard },
  { name: 'How It Works', url: '/how-it-works', icon: FileText },
  { name: 'About', url: '/about', icon: Users },
  { name: 'Contact', url: '/contact', icon: MessageSquare },
];

const serviceIcons = {
  wrench: Wrench,
  car: Car,
  paintbrush: Paintbrush,
  zap: Zap,
  disc: Disc,
  settings: Settings,
} as const;

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const { isComplete, completionPercentage } = useProfileCompletion();

  // Scroll effect for header shadow
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname === path || pathname?.startsWith(path + '/');
  };

  // Get navigation items based on user role
  const getAuthNavItems = () => {
    if (!session) return [];

    if (session.user?.role === 'customer') {
      return [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Find Workshops', href: '/workshops', icon: Search },
        { name: 'My Garage', href: '/cars', icon: Car },
        { name: 'Quotes', href: '/quotations', icon: DollarSign },
        { name: 'Appointments', href: '/appointments', icon: Calendar },
        { name: 'Completed Jobs', href: '/completed-jobs', icon: CheckCircle },
      ];
    }

    if (session.user?.role === 'workshop') {
      return [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Quote Requests', href: '/quotes', icon: MessageSquare },
        { name: 'Appointments', href: '/appointments', icon: Calendar },
        { name: 'Active Jobs', href: '/workshop/jobs', icon: Clock },
        { name: 'Completed Jobs', href: '/completed-jobs', icon: CheckCircle },
        { name: 'Customers', href: '/workshop/customers', icon: Users },
      ];
    }

    return [];
  };

  const authNavItems = getAuthNavItems();

  // Generate navigation schema for SEO
  const navigationSchema = generateSiteNavigationSchema([
    ...publicNavItems.map(item => ({ name: item.name, url: item.url })),
    { name: 'Services', url: '/services' },
    { name: 'Workshops', url: '/workshops' },
  ]);

  return (
    <>
      <StructuredData data={navigationSchema} />

      <motion.header
        className={cn(
          'sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-shadow duration-300',
          scrolled && 'shadow-md border-b border-border'
        )}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex h-16 items-center justify-between" aria-label="Main navigation">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center space-x-2 text-xl sm:text-2xl font-bold text-primary hover:opacity-90 transition-opacity"
              aria-label={`${APP_NAME} Home`}
            >
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <Wrench className="h-5 w-5 text-primary-foreground" aria-hidden="true" />
              </div>
              <span className="hidden sm:inline">{APP_NAME}</span>
              <span className="sm:hidden">RC</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {!session ? (
                <>
                  {/* Public Navigation */}
                  {publicNavItems.map((item) => (
                    <Link
                      key={item.url}
                      href={item.url}
                      className={cn(
                        'px-4 py-2 text-sm font-medium rounded-md transition-colors',
                        isActive(item.url)
                          ? 'bg-primary/10 text-primary'
                          : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                      )}
                      aria-current={isActive(item.url) ? 'page' : undefined}
                    >
                      {item.name}
                    </Link>
                  ))}

                  {/* Services Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className={cn(
                          'flex items-center space-x-1',
                          pathname?.startsWith('/services') && 'bg-primary/10 text-primary'
                        )}
                      >
                        <span>Services</span>
                        <ChevronDown className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="center" className="w-64">
                      {SERVICE_CATEGORIES.map((service) => {
                        const Icon = serviceIcons[service.icon as keyof typeof serviceIcons];
                        return (
                          <DropdownMenuItem key={service.slug} asChild>
                            <Link
                              href={`/services/${service.slug}`}
                              className="flex items-start space-x-3 cursor-pointer py-3"
                            >
                              <Icon className="h-5 w-5 text-primary mt-0.5" aria-hidden="true" />
                              <div>
                                <div className="font-semibold">{service.name}</div>
                                <div className="text-xs text-muted-foreground">{service.description}</div>
                              </div>
                            </Link>
                          </DropdownMenuItem>
                        );
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Workshops Link */}
                  <Link
                    href="/workshops"
                    className={cn(
                      'px-4 py-2 text-sm font-medium rounded-md transition-colors',
                      isActive('/workshops')
                        ? 'bg-primary/10 text-primary'
                        : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                    )}
                    aria-current={isActive('/workshops') ? 'page' : undefined}
                  >
                    Workshops
                  </Link>
                </>
              ) : (
                <>
                  {/* Authenticated Navigation */}
                  {authNavItems.slice(0, 5).map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md transition-colors',
                        isActive(item.href)
                          ? 'bg-primary/10 text-primary'
                          : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                      )}
                      aria-current={isActive(item.href) ? 'page' : undefined}
                    >
                      {item.icon && <item.icon className="h-4 w-4" aria-hidden="true" />}
                      <span>{item.name}</span>
                    </Link>
                  ))}

                  {/* More Menu for additional items */}
                  {authNavItems.length > 5 && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Menu className="h-4 w-4 mr-1" aria-hidden="true" />
                          More
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        {authNavItems.slice(5).map((item) => (
                          <DropdownMenuItem key={item.href} asChild>
                            <Link href={item.href} className="flex items-center space-x-2 cursor-pointer">
                              {item.icon && <item.icon className="h-4 w-4" aria-hidden="true" />}
                              <span>{item.name}</span>
                            </Link>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </>
              )}
            </div>

            {/* Desktop Auth Buttons / User Menu */}
            <div className="hidden lg:flex items-center space-x-3">
              {status === 'loading' ? (
                <div className="h-9 w-24 bg-muted animate-pulse rounded-md" />
              ) : session ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center space-x-2">
                      <User className="h-4 w-4" aria-hidden="true" />
                      <span className="max-w-[120px] truncate">{session.user?.name}</span>
                      {!isComplete && session.user?.role === 'workshop' && (
                        <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                          {completionPercentage}%
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64">
                    <div className="px-3 py-2 border-b border-border">
                      <p className="text-sm font-semibold">{session.user?.name}</p>
                      <p className="text-xs text-muted-foreground">{session.user?.email}</p>
                      <Badge variant="outline" className="text-xs capitalize mt-1">
                        {session.user?.role}
                      </Badge>
                    </div>

                    {/* Quick Actions */}
                    {session.user?.role === 'customer' && (
                      <>
                        <div className="px-2 py-2">
                          <p className="text-xs font-semibold text-muted-foreground uppercase px-2 mb-2">
                            Quick Actions
                          </p>
                          <DropdownMenuItem asChild>
                            <Link href="/quotations/request" className="flex items-center space-x-2 cursor-pointer">
                              <Plus className="h-4 w-4" aria-hidden="true" />
                              <div>
                                <div className="font-semibold">Request Quote</div>
                                <div className="text-xs text-muted-foreground">Get repair estimates</div>
                              </div>
                            </Link>
                          </DropdownMenuItem>
                        </div>
                        <DropdownMenuSeparator />
                      </>
                    )}

                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="flex items-center space-x-2 cursor-pointer">
                        <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
                        <span>Dashboard</span>
                      </Link>
                    </DropdownMenuItem>

                    {session.user?.role === 'workshop' && (
                      <DropdownMenuItem asChild>
                        <Link href="/profile" className="flex items-center space-x-2 cursor-pointer">
                          <Building2 className="h-4 w-4" aria-hidden="true" />
                          <span>Workshop Profile</span>
                        </Link>
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="flex items-center space-x-2 cursor-pointer">
                        <Settings className="h-4 w-4" aria-hidden="true" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                      onClick={() => signOut({ callbackUrl: '/' })}
                      className="flex items-center space-x-2 cursor-pointer text-destructive focus:text-destructive"
                    >
                      <LogOut className="h-4 w-4" aria-hidden="true" />
                      <span>Sign Out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Button variant="outline" asChild>
                    <Link href="/auth/login">Log In</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/quotations/request">Find a Workshop</Link>
                  </Button>
                  <Button variant="secondary" asChild>
                    <Link href="/auth/register?type=workshop">Join as Workshop</Link>
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open mobile menu"
            >
              <Menu className="h-6 w-6" aria-hidden="true" />
            </Button>
          </nav>
        </div>
      </motion.header>

      {/* Mobile Menu Dialog */}
      <Dialog open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <DialogContent className="sm:max-w-md h-full max-h-screen overflow-y-auto p-0">
          <DialogTitle className="sr-only">Navigation Menu</DialogTitle>
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 100 }}
                transition={{ duration: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
                className="flex flex-col h-full"
              >
                {/* Mobile Menu Header */}
                <div className="flex items-center justify-between p-4 border-b">
                  <Link
                    href="/"
                    className="flex items-center space-x-2 text-xl font-bold text-primary"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                      <Wrench className="h-5 w-5 text-primary-foreground" aria-hidden="true" />
                    </div>
                    <span>{APP_NAME}</span>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setMobileMenuOpen(false)}
                    aria-label="Close mobile menu"
                  >
                    <X className="h-6 w-6" aria-hidden="true" />
                  </Button>
                </div>

                {/* Mobile Menu Content */}
                <div className="flex-1 overflow-y-auto p-4">
                  <nav className="space-y-1" aria-label="Mobile navigation">
                    {!session ? (
                      <>
                        {/* Public Navigation */}
                        {publicNavItems.map((item, index) => (
                          <motion.div
                            key={item.url}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <Link
                              href={item.url}
                              className={cn(
                                'flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-colors',
                                isActive(item.url)
                                  ? 'bg-primary text-primary-foreground'
                                  : 'text-foreground hover:bg-accent'
                              )}
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              {item.icon && <item.icon className="h-5 w-5" aria-hidden="true" />}
                              <span>{item.name}</span>
                            </Link>
                          </motion.div>
                        ))}

                        {/* Services Section */}
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 }}
                          className="pt-4"
                        >
                          <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Services
                          </div>
                          <div className="space-y-1">
                            {SERVICE_CATEGORIES.map((service) => {
                              const Icon = serviceIcons[service.icon as keyof typeof serviceIcons];
                              return (
                                <Link
                                  key={service.slug}
                                  href={`/services/${service.slug}`}
                                  className="flex items-center space-x-3 px-4 py-3 rounded-lg text-base hover:bg-accent transition-colors"
                                  onClick={() => setMobileMenuOpen(false)}
                                >
                                  <Icon className="h-5 w-5 text-primary flex-shrink-0" aria-hidden="true" />
                                  <div className="min-w-0">
                                    <div className="font-medium">{service.name}</div>
                                    <div className="text-xs text-muted-foreground truncate">{service.description}</div>
                                  </div>
                                </Link>
                              );
                            })}
                          </div>
                        </motion.div>

                        {/* Workshops Link */}
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 }}
                          className="pt-4"
                        >
                          <Link
                            href="/workshops"
                            className={cn(
                              'flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-colors',
                              isActive('/workshops')
                                ? 'bg-primary text-primary-foreground'
                                : 'text-foreground hover:bg-accent'
                            )}
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <MapPin className="h-5 w-5" aria-hidden="true" />
                            <span>Browse Workshops</span>
                          </Link>
                        </motion.div>

                        {/* Auth Buttons */}
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.6 }}
                          className="pt-6 space-y-3"
                        >
                          <Button asChild className="w-full" size="lg">
                            <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                              Log In
                            </Link>
                          </Button>
                          <Button asChild className="w-full" size="lg" variant="secondary">
                            <Link href="/quotations/request" onClick={() => setMobileMenuOpen(false)}>
                              Find a Workshop
                            </Link>
                          </Button>
                          <Button asChild className="w-full" size="lg" variant="outline">
                            <Link href="/auth/register?type=workshop" onClick={() => setMobileMenuOpen(false)}>
                              Join as Workshop
                            </Link>
                          </Button>
                        </motion.div>
                      </>
                    ) : (
                      <>
                        {/* Authenticated Navigation */}
                        {authNavItems.map((item, index) => (
                          <motion.div
                            key={item.href}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <Link
                              href={item.href}
                              className={cn(
                                'flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-colors',
                                isActive(item.href)
                                  ? 'bg-primary text-primary-foreground'
                                  : 'text-foreground hover:bg-accent'
                              )}
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              {item.icon && <item.icon className="h-5 w-5" aria-hidden="true" />}
                              <span>{item.name}</span>
                            </Link>
                          </motion.div>
                        ))}

                        {/* User Menu Section */}
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.6 }}
                          className="pt-6 space-y-1"
                        >
                          <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Account
                          </div>
                          <div className="px-4 py-3 bg-muted/50 rounded-lg">
                            <p className="text-sm font-semibold">{session.user?.name}</p>
                            <p className="text-xs text-muted-foreground">{session.user?.email}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="text-xs capitalize">
                                {session.user?.role}
                              </Badge>
                              {!isComplete && session.user?.role === 'workshop' && (
                                <Badge variant="destructive" className="text-xs">
                                  Profile {completionPercentage}%
                                </Badge>
                              )}
                            </div>
                          </div>

                          {session.user?.role === 'workshop' && (
                            <Link
                              href="/profile"
                              className="flex items-center space-x-3 px-4 py-3 rounded-lg text-base hover:bg-accent transition-colors"
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              <Building2 className="h-5 w-5" aria-hidden="true" />
                              <span>Workshop Profile</span>
                            </Link>
                          )}

                          <Link
                            href="/settings"
                            className="flex items-center space-x-3 px-4 py-3 rounded-lg text-base hover:bg-accent transition-colors"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <Settings className="h-5 w-5" aria-hidden="true" />
                            <span>Settings</span>
                          </Link>

                          <button
                            onClick={() => {
                              setMobileMenuOpen(false);
                              signOut({ callbackUrl: '/' });
                            }}
                            className="flex items-center space-x-3 px-4 py-3 rounded-lg text-base hover:bg-destructive/10 text-destructive transition-colors w-full"
                          >
                            <LogOut className="h-5 w-5" aria-hidden="true" />
                            <span>Sign Out</span>
                          </button>
                        </motion.div>
                      </>
                    )}
                  </nav>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </>
  );
}
