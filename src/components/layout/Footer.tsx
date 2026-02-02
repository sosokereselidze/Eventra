import { Link } from 'react-router-dom';
import { CalendarDays, Facebook, Instagram, Mail, Phone, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="border-t border-border/50 bg-[#25140e] text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />

            <div className="container mx-auto px-4 py-16 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12 text-center">
                    {/* Brand Column */}
                    <div className="space-y-4 flex flex-col items-center">
                        <Link to="/" className="flex items-center gap-3 group">
                            <div className="h-12 w-12 flex items-center justify-center overflow-hidden">
                                <img src="/eventra_logo.png" alt="Eventra Logo" className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110" />
                            </div>
                            <span className="font-display font-bold text-2xl tracking-tight text-white">Eventra</span>
                        </Link>
                        <p className="text-muted-foreground leading-relaxed max-w-xs mx-auto">
                            Discover and book unforgettable experiences. The easiest way to find events that matter to you.
                        </p>
                        <div className="flex gap-4 justify-center">
                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:text-primary hover:bg-primary/10" asChild>
                                <a href="https://www.facebook.com/soso.kereselidze.477083/" target="_blank" rel="noopener noreferrer">
                                    <Facebook className="h-4 w-4" />
                                </a>
                            </Button>
                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:text-primary hover:bg-primary/10" asChild>
                                <a href="https://www.instagram.com/soso_kereselidze/" target="_blank" rel="noopener noreferrer">
                                    <Instagram className="h-4 w-4" />
                                </a>
                            </Button>
                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:text-primary hover:bg-primary/10" asChild>
                                <a href="https://wa.me/995511110822" target="_blank" rel="noopener noreferrer">
                                    <MessageCircle className="h-4 w-4" />
                                </a>
                            </Button>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="flex flex-col items-center">
                        <h3 className="font-display font-bold text-lg mb-6 text-white">Quick Links</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link to="/events" className="text-muted-foreground hover:text-primary transition-colors">
                                    Browse Events
                                </Link>
                            </li>
                            <li>
                                <Link to="/auth?mode=signup" className="text-muted-foreground hover:text-primary transition-colors">
                                    Sign Up
                                </Link>
                            </li>
                            <li>
                                <Link to="/auth" className="text-muted-foreground hover:text-primary transition-colors">
                                    Sign In
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div className="flex flex-col items-center">
                        <h3 className="font-display font-bold text-lg mb-6 text-white">Contact Us</h3>
                        <ul className="space-y-4">
                            <li className="flex items-center justify-center gap-3 text-muted-foreground">
                                <Mail className="h-5 w-5 text-primary shrink-0" />
                                <span>soso.kereselidze1@gmail.com</span>
                            </li>
                            <li className="flex items-center justify-center gap-3 text-muted-foreground">
                                <Phone className="h-5 w-5 text-primary shrink-0" />
                                <span>+995 511 11 08 22</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-border/50 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-muted-foreground">
                        © {currentYear} Eventra. All rights reserved.
                    </p>
                    <div className="flex gap-6 text-sm text-muted-foreground">
                        <Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
                        <Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
                        <Link to="/cookies" className="hover:text-primary transition-colors">Cookies</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
