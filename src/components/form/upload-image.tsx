'use client';
import { useUploadAssetImageMutation } from '@/hooks/asset';
import { Delete, ImageUp, LoaderCircle, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { Dispatch, useEffect, useRef, useState } from 'react';
import { ImageZoom } from '@/components/ui/shadcn-io/image-zoom';
const ImageUploader = ({
  image,
  onChange,
  onDelete,
  isDeleteAvailable,
}: {
  image?: { url: string; contentType: string };
  isDeleteAvailable?: boolean;
  onChange: (url: { url: string; contentType: string }) => void;
  onDelete?: (url: string) => void;
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { mutate: uploadImage, isPending: isUploadImagePending } =
    useUploadAssetImageMutation({
      onSuccess: () => {},
    });
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    uploadImage(formData, {
      onSuccess: (uploadedImageData) => {
        onChange(uploadedImageData);
      },
    });
  };
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  const hasImage = !!image;
  return (
    <div className="flex items-center justify-center">
      <input
        type="file"
        className="hidden"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileChange}
      />
      {hasImage ? (
        <div className="relative">
          <ImageZoom>
            <Image
              src={image!.url}
              alt="Uploaded image"
              className="object-contain rounded-md h-32 w-auto border border-gray-300 p-2"
              width={1920}
              height={1920}
            />
          </ImageZoom>
          {onDelete && isDeleteAvailable && (
            <button
              className="absolute top-2 left-2 bg-red-500 text-white rounded-md p-2 hover:bg-red-600 transition"
              onClick={() => onDelete(image!.url)}
              type="button"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      ) : (
        <button
          className="w-32 h-32
          bg-gray-100
          border-2 border-dashed border-gray-300
          flex items-center justify-center
          rounded-lg overflow-hidden
          hover:border-primary hover:bg-primary/10
          transition
          text-sm"
          onClick={handleUploadClick}
          type="button"
        >
          {isUploadImagePending ? (
            <LoaderCircle className="animate-spin" color="gray" />
          ) : (
            <ImageUp className="mx-auto" size={40} color="gray" />
          )}
        </button>
      )}
    </div>
  );
};

const MultiImageUploader = ({
  max = 4,
  previewImages = [],
  isAddAvailable = true,
  setPreviewImages,
}: {
  max?: number;
  isAddAvailable?: boolean;
  previewImages?: { url: string; contentType: string }[];
  setPreviewImages: Dispatch<
    React.SetStateAction<{ url: string; contentType: string }[]>
  >;
}) => {
  return (
    <div className="grid grid-cols-2 min-[1200px]:grid-cols-3 min-[1400px]:grid-cols-4 gap-4">
      {previewImages.map((imgUrl, index) => (
        <ImageUploader
          key={index}
          image={imgUrl}
          isDeleteAvailable={isAddAvailable}
          onDelete={(url) => {
            setPreviewImages((prev) => prev.filter((img) => img.url !== url));
          }}
          onChange={(newImage) => {
            setPreviewImages((prev) =>
              prev.map((img, idx) => (idx === index ? newImage : img))
            );
          }}
        />
      ))}

      {previewImages.length < max && isAddAvailable && (
        <ImageUploader
          onChange={(image) => {
            setPreviewImages((prev) => [...prev, image]);
          }}
        />
      )}
    </div>
  );
};
export default MultiImageUploader;
