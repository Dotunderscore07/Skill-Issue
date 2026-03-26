import { useState, useRef } from 'react';

export function usePhotoUpload(onPhotoChange: (dataUrl: string) => void) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const dataUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
      reader.readAsDataURL(file);
    });

    onPhotoChange(dataUrl);
  };

  const triggerUpload = () => fileInputRef.current?.click();

  return { fileInputRef, handleFileChange, triggerUpload };
}
