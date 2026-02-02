import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export default function Cookies() {
    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="pt-24 pb-16 container mx-auto px-4 max-w-4xl">
                <div className="relative">
                    <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full -z-10" />
                    <div className="bg-card/30 backdrop-blur-xl border border-border/50 rounded-3xl p-8 md:p-12 shadow-2xl">
                        <h1 className="font-display text-4xl md:text-5xl font-bold mb-8 gradient-text">Cookie Policy</h1>

                        <div className="prose prose-invert max-w-none space-y-8 text-muted-foreground">
                            <p className="text-lg">Last updated: {new Date().toLocaleDateString()}</p>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-bold text-foreground">1. What Are Cookies</h2>
                                <p className="leading-relaxed">
                                    Cookies are simple text files that are stored on your computer or mobile device by a website's server. Each cookie is unique to your web browser. It will contain some anonymous information such as a unique identifier and the site name and some digits and numbers.
                                </p>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-bold text-foreground">2. How We Use Cookies</h2>
                                <p className="leading-relaxed">
                                    We use cookies to:
                                </p>
                                <ul className="list-disc pl-6 space-y-3">
                                    <li>Make our website work as you'd expect</li>
                                    <li>Remember your settings during and between visits</li>
                                    <li>Improve the speed/security of the site</li>
                                    <li>Allow you to share pages with social networks</li>
                                    <li>Continuously improve our website for you</li>
                                </ul>
                            </section>

                            <section className="space-y-4">
                                <h2 className="text-2xl font-bold text-foreground">3. Granting us permission to use cookies</h2>
                                <p className="leading-relaxed">
                                    If the settings on your software that you are using to view this website (your browser) are adjusted to accept cookies we take this, and your continued use of our website, to mean that you are fine with this. Should you wish to remove or not use cookies from our site you can learn how to do this below, however doing so will likely mean that our site will not work as you would expect.
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
