'use client';

import type React from 'react';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, X, ImageIcon, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/contexts/toast-context';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  required?: boolean;
  className?: string;
}

export function ImageUpload({ value, onChange, label = 'Imagem', required = false, className = '' }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { error: showError } = useToast();

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      showError('Por favor, selecione apenas arquivos de imagem');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
      showError('A imagem deve ter no máximo 5MB');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Erro no upload');
      }

      const data = await response.json();
      onChange(data.url);
    } catch (error) {
      console.error('Erro no upload:', error);
      showError('Erro ao fazer upload da imagem. Tente novamente.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const removeImage = () => {
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <Label className="text-sm font-medium text-gray-900 dark:text-white">
        {label} {required && '*'}
      </Label>

      <div className="flex flex-col md:flex-row gap-4 items-start">
        {value ? (
          <div className="relative group flex-shrink-0 w-full md:w-72">
            <div className="relative w-full aspect-[2/1] rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
              <Image
                src={value || '/placeholder.svg'}
                alt="Thumbnail do curso"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 288px"
              />
              <Button
                type="button"
                onClick={removeImage}
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2 w-6 h-6 p-0 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex-shrink-0 w-full md:w-72">
            <div
              className={`relative border-2 border-dashed rounded-lg w-full aspect-[2/1] flex flex-col items-center justify-center cursor-pointer transition-colors ${
                dragActive
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
              } ${isUploading ? 'pointer-events-none opacity-50' : ''} `}
              onDrop={handleDrop}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInputChange}
                className="hidden"
              />

              {isUploading ? (
                <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
              ) : (
                <ImageIcon className="w-6 h-6 text-gray-400 dark:text-gray-500" />
              )}
            </div>
          </div>
        )}

        <div className="flex-1 space-y-2">
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {isUploading ? 'Fazendo upload...' : value ? 'Thumbnail do curso' : 'Adicionar thumbnail'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {value ? 'Clique no X para remover' : 'Clique na área ou arraste uma imagem'}
            </p>
          </div>

          {!value && !isUploading && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="bg-transparent dark:border-gray-600 dark:text-gray-300"
            >
              <Upload className="w-4 h-4 mr-2" />
              Selecionar Arquivo
            </Button>
          )}

          <p className="text-xs text-gray-500 dark:text-gray-400">
            Formatos: PNG, JPG, JPEG • Máximo: 5MB
            <br />
            Recomendado: 384x192px (proporção 2:1)
          </p>
        </div>
      </div>
    </div>
  );
}
