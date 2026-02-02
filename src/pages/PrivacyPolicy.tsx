import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="pt-24 pb-16 container mx-auto px-4 max-w-4xl">
                <div className="relative">
                    <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full -z-10" />
                    <div className="bg-card/30 backdrop-blur-xl border border-border/50 rounded-3xl p-8 md:p-12 shadow-2xl">
                        <h1 className="font-display text-4xl md:text-5xl font-bold mb-8 gradient-text">Privacy Policy</h1>

                        <div className="prose prose-invert max-w-none space-y-8 text-muted-foreground">
                            <p className="text-lg">Last updated: {new Date().toLocaleDateString()}</p>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-bold text-foreground">1. Introduction</h2>
                                <p className="leading-relaxed">
                                    Welcome to Eventra ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about our policy, or our practices with regards to your personal information, please contact us.
                                </p>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-bold text-foreground">2. Information We Collect</h2>
                                <p className="leading-relaxed">
                                    We collect personal information that you voluntarily provide to us when you register on the website, express an interest in obtaining information about us or our products and services, when you participate in activities on the website or otherwise when you contact us.
                                </p>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-bold text-foreground">3. How We Use Your Information</h2>
                                <p className="leading-relaxed">
                                    We use personal information collected via our website for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations.
                                </p>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-bold text-foreground">4. Contact Us</h2>
                                <p className="leading-relaxed">
                                    If you have questions or comments about this policy, you may email us at <span className="text-primary">soso.kereselidze1@gmail.com</span>.
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
