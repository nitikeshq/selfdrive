import { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      const dismissed = localStorage.getItem('pwa-install-dismissed');
      if (!dismissed) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setShowPrompt(false);
      localStorage.removeItem('pwa-install-dismissed');
    }

    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  if (!showPrompt || !deferredPrompt) return null;

  return (
    <Card 
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 p-4 shadow-lg z-50 bg-white dark:bg-gray-900 border-2 border-sky-500"
      data-testid="card-pwa-install-prompt"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-sky-500 to-cyan-600 rounded-lg flex items-center justify-center">
          <Download className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
            Install SelfDriveKaro
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Install our app for quick access and a better experience!
          </p>
          <div className="flex gap-2">
            <Button 
              onClick={handleInstall}
              size="sm"
              className="bg-sky-500 hover:bg-sky-600 text-white"
              data-testid="button-install-pwa"
            >
              Install
            </Button>
            <Button 
              onClick={handleDismiss}
              size="sm"
              variant="outline"
              data-testid="button-dismiss-pwa"
            >
              Not now
            </Button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          data-testid="button-close-pwa-prompt"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </Card>
  );
}
