import React, { useState, useRef } from 'react';
import { UploadCloud, Image, Video, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';

export const MediaUploader = ({
  type = 'image', // 'image' or 'video'
  onUploadSuccess,
  currentUrl = '',
  label = 'Upload Media',
  helpText = 'PNG, JPG, WEBP up to 10MB'
}) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(currentUrl);
  const fileInputRef = useRef(null);
  const toast = useToast();

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size
    const maxSizeBytes = type === 'image' ? 10 * 1024 * 1024 : 100 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      toast.error(`File is too large! Maximum allowed size is ${type === 'image' ? '10MB' : '100MB'}.`);
      return;
    }

    const formData = new FormData();
    const endpoint = type === 'image' ? '/media/upload-image' : '/media/upload-video';
    formData.append(type === 'image' ? 'image' : 'video', file);

    setUploading(true);
    try {
      const res = await api.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (res.data?.success) {
        setPreviewUrl(res.data.url);
        toast.success(res.data.message || 'File uploaded successfully!');
        if (onUploadSuccess) {
          onUploadSuccess({
            url: res.data.url,
            publicId: res.data.publicId,
            duration: res.data.duration || 0
          });
        }
      }
    } catch (err) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
          {label}
        </label>
      )}

      <div
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
          uploading
            ? 'border-brand-300 bg-brand-50/50 cursor-wait'
            : 'border-slate-300 hover:border-brand-500 hover:bg-slate-50'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept={type === 'image' ? 'image/*' : 'video/*'}
          className="hidden"
          disabled={uploading}
        />

        {uploading ? (
          <div className="flex flex-col items-center justify-center space-y-2 py-4">
            <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
            <p className="text-sm font-semibold text-brand-700">
              Uploading {type}... Please wait
            </p>
          </div>
        ) : previewUrl ? (
          <div className="space-y-3">
            {type === 'image' ? (
              <div className="relative w-full max-w-xs mx-auto h-36 rounded-xl overflow-hidden shadow-sm">
                <img
                  src={previewUrl}
                  alt="Uploaded preview"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2 text-emerald-600 font-semibold text-sm">
                <CheckCircle className="w-5 h-5" />
                <span>Video attached and ready</span>
              </div>
            )}
            <p className="text-xs text-brand-600 font-bold hover:underline">
              Click to replace {type}
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-2 py-2">
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
              {type === 'image' ? (
                <Image className="w-6 h-6" />
              ) : (
                <Video className="w-6 h-6" />
              )}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-700">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-slate-400 mt-0.5">{helpText}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
