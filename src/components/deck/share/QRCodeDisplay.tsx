
import React from 'react';
import { QrCode } from 'lucide-react';
import QRCode from 'qrcode.react';

interface QRCodeDisplayProps {
  shareUrl: string;
}

export const QRCodeDisplay = ({ shareUrl }: QRCodeDisplayProps) => {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="mb-4">
        <QrCode className="h-6 w-6 text-flashcard-primary" />
      </div>
      <div className="bg-white p-4 rounded-lg shadow-md">
        <QRCode value={shareUrl} size={180} renderAs="svg" />
      </div>
      <p className="text-sm text-muted-foreground mt-2">
        Scan to access this deck
      </p>
    </div>
  );
};
