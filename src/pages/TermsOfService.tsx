import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export default function TermsOfService() {
    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="pt-24 pb-16 container mx-auto px-4 max-w-4xl">
                <div className="relative">
                    <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full -z-10" />
                    <div className="bg-card/30 backdrop-blur-xl border border-border/50 rounded-3xl p-8 md:p-12 shadow-2xl">
                        <h1 className="font-display text-4xl md:text-5xl font-bold mb-8 gradient-text">Terms of Service</h1>

                        <div className="prose prose-invert max-w-none space-y-8 text-muted-foreground">
                            <p className="text-lg">Last updated: {new Date().toLocaleDateString()}</p>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-bold text-foreground">1. Agreement to Terms</h2>
                                <p className="leading-relaxed">
                                    These Terms of Service constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("you") and Eventra ("we," "us" or "our"), concerning your access to and use of the Eventra website as well as any other media form, media channel, mobile website or mobile application related, linked, or otherwise connected thereto (collectively, the "Site").
                                </p>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-bold text-foreground">2. Intellectual Property Rights</h2>
                                <p className="leading-relaxed">
                                    Unless otherwise indicated, the Site is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Site (collectively, the "Content") and the trademarks, service marks, and logos contained therein (the "Marks") are owned or controlled by us or licensed to us, and are protected by copyright and trademark laws and various other intellectual property rights.
                                </p>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-bold text-foreground">3. User Representations</h2>
                                <p className="leading-relaxed">
                                    By using the Site, you represent and warrant that: (1) all registration information you submit will be true, accurate, current, and complete; (2) you will maintain the accuracy of such information and promptly update such registration information as necessary.
                                </p>
                            </section>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
