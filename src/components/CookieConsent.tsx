import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, Cookie, Shield, BarChart3, Settings } from 'lucide-react';



interface CookieCategory {
  id: string;
  name: string;
  description: string;
  required: boolean;
  enabled: boolean;
  icon: React.ReactNode;
}

const CookieConsent: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [categories, setCategories] = useState<CookieCategory[]>([
    {
      id: 'necessary',
      name: 'Necessary',
      description: 'Essential cookies for the website to function properly. These cannot be disabled.',
      required: true,
      enabled: true,
      icon: <Shield className="w-4 h-4" />,
    },
    {
      id: 'analytics',
      name: 'Analytics',
      description: 'Help us understand how visitors interact with our website to improve performance.',
      required: false,
      enabled: false,
      icon: <BarChart3 className="w-4 h-4" />,
    },
    {
      id: 'marketing',
      name: 'Marketing',
      description: 'Used to track visitors across websites and display relevant advertisements.',
      required: false,
      enabled: false,
      icon: <Cookie className="w-4 h-4" />,
    },
  ]);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      // Delay visibility for better UX
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    const prefs = {
      necessary: true,
      analytics: true,
      marketing: true,
    };
    saveConsent(prefs);
  };

  const handleRejectAll = () => {
    const prefs = {
      necessary: true,
      analytics: false,
      marketing: false,
    };
    saveConsent(prefs);
  };

  const saveConsent = (prefs: Record<string, boolean>) => {
    localStorage.setItem('cookie-consent', JSON.stringify(prefs));
    setIsVisible(false);
  };

  const toggleCategory = (id: string) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === id && !cat.required ? { ...cat, enabled: !cat.enabled } : cat
      )
    );
  };

  const handleSavePreferences = () => {
    const prefs = categories.reduce(
      (acc, cat) => ({ ...acc, [cat.id]: cat.enabled }),
      {} as Record<string, boolean>
    );
    saveConsent(prefs);
  };

  return (
    // <AnimatePresence>
      isVisible ? (
        <div
           className="fixed bottom-0 left-0 right-0 z-[100] p-4 md:p-6"
        >
          {/* ... existing content ... */}
          <div className="max-w-5xl mx-auto">
            <Card className="relative overflow-hidden border-border/50 bg-background/80 backdrop-blur-2xl shadow-2xl p-6 md:p-8">
              <div className="absolute inset-0 bg-primary/5 -z-10 pointer-events-none" />
              
              <button
                onClick={() => setIsVisible(false)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              {!showSettings ? (
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center animate-pulse">
                    <Cookie className="w-7 h-7 text-primary" />
                  </div>
                  
                  <div className="flex-1 text-center md:text-left space-y-2">
                    <h2 className="text-xl md:text-2xl font-bold text-foreground">
                      Cookie Preferences
                    </h2>
                    <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-2xl">
                      We use cookies to improve your experience. Some are essential for the site to function, while others help us analyze traffic. You can change your preferences at any time.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <Button
                      onClick={handleAcceptAll}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 shadow-lg shadow-primary/20"
                    >
                      Accept All
                    </Button>
                    <Button
                      onClick={() => setShowSettings(true)}
                      variant="outline"
                      className="border-border/50 hover:bg-accent font-medium"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Manage
                    </Button>
                    <Button
                      onClick={handleRejectAll}
                      variant="ghost"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      Reject Non-Essential
                    </Button>
                  </div>
                </div>
              ) : (
                <div 
                  className="space-y-6"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Settings className="w-5 h-5 text-primary" />
                    </div>
                    <h2 className="text-xl font-bold">Manage Cookie Settings</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {categories.map((cat) => (
                      <div
                        key={cat.id}
                        className={`p-4 rounded-xl border transition-all ${
                          cat.enabled ? 'border-primary/50 bg-primary/5' : 'border-border/50 bg-card/50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="p-2 rounded-lg bg-background border border-border/50">
                            {cat.icon}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                              {cat.required ? 'Required' : (cat.enabled ? 'On' : 'Off')}
                            </span>
                            {!cat.required && (
                              <button
                                onClick={() => toggleCategory(cat.id)}
                                className={`w-10 h-5 rounded-full relative transition-colors ${
                                  cat.enabled ? 'bg-primary' : 'bg-muted-foreground/30'
                                }`}
                              >
                                <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${
                                  cat.enabled ? 'left-6' : 'left-1'
                                }`} />
                              </button>
                            )}
                          </div>
                        </div>
                        <h3 className="font-semibold mb-1">{cat.name}</h3>
                        <p className="text-xs text-muted-foreground leading-tight">
                          {cat.description}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button
                      variant="ghost"
                      onClick={() => setShowSettings(false)}
                      className="text-muted-foreground"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handleSavePreferences}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8"
                    >
                      Save Preferences
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      ) : null
    // </AnimatePresence>
  );
};

export default CookieConsent;
