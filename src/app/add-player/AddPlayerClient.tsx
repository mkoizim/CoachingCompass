'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { QRCodeSVG as QRCode } from 'qrcode.react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Copy, Mail, QrCode, ArrowRight } from 'lucide-react';

export function AddPlayerClient() {
  const [surveyUrl, setSurveyUrl] = useState('');
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // This code runs only on the client, after the component has mounted.
    // This avoids hydration errors by ensuring window.location.origin is only
    // accessed in the browser.
    setSurveyUrl(window.location.origin + '/survey');
  }, []);
  
  const copyToClipboard = () => {
    if (!surveyUrl) return;
    navigator.clipboard.writeText(surveyUrl);
    toast({
      title: 'Copied to clipboard!',
      description: 'You can now share the link with the player.',
    });
  };

  const handleEmail = () => {
    if (!surveyUrl) return;
    const subject = 'Complete Your CoachingCompass Player Survey';
    const body = `Please complete your player survey by visiting this link: ${surveyUrl}`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };
  
  const proceedToSurvey = () => {
    router.push('/survey');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-headline font-bold text-primary">Add a New Player</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Choose one of the options below to get the survey to your new player.
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          In this demo, a submitted survey is saved in the browser it was completed in. Use &ldquo;Proceed to Survey&rdquo; below to see it on your roster.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2"><Copy /> Shareable Link</CardTitle>
              <CardDescription>Copy the link and send it to the player via text or another messaging app.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-2">
              <Input value={surveyUrl} readOnly className="bg-muted" />
              <Button size="icon" variant="outline" onClick={copyToClipboard} disabled={!surveyUrl}>
                <Copy className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="font-headline flex items-center gap-2"><Mail /> Email Link</CardTitle>
              <CardDescription>Compose a new email containing the survey link.</CardDescription>
            </CardHeader>
            <CardContent>
                <Button className="w-full" onClick={handleEmail} disabled={!surveyUrl}>
                    <Mail /> Compose Email
                </Button>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-8">
            <Card className="text-center">
                <CardHeader>
                    <CardTitle className="font-headline flex items-center justify-center gap-2"><QrCode /> Scan QR Code</CardTitle>
                    <CardDescription>The player can scan this code with their mobile device to open the survey directly.</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center p-6 min-h-[252px] items-center">
                    {surveyUrl ? (
                      <div className="p-4 bg-white rounded-lg">
                        <QRCode value={surveyUrl} size={200} fgColor="#000000" bgColor="#FFFFFF" />
                      </div>
                    ) : (
                      <div className="text-muted-foreground">Generating QR Code...</div>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
      <div className="mt-12 pt-8 border-t">
          <Card className="bg-card/50">
              <CardHeader className="text-center">
                  <CardTitle className="font-headline">Ready to Fill It Out Now?</CardTitle>
                  <CardDescription>If you are with the player, you can proceed directly to the survey.</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                  <Button size="lg" onClick={proceedToSurvey}>
                      Proceed to Survey <ArrowRight />
                  </Button>
              </CardContent>
          </Card>
      </div>
    </div>
  );
}
