import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import api from '../api/axios';
import type { ImageData } from '../pages/Dashboard';

interface ImageGalleryProps {
  images: ImageData[];
  onDeleteImage: (imageUrl: string, sizeSavedBytes: number) => void;
}

export function ImageGallery({ images, onDeleteImage }: ImageGalleryProps) {
  const [deletingUrls, setDeletingUrls] = useState<string[]>([]);

  const handleDelete = async (imageUrl: string) => {
  if (deletingUrls.includes(imageUrl)) return;

  setDeletingUrls(prev => [...prev, imageUrl]);

  try {
    onDeleteImage(imageUrl, 0);
  } finally {
    setDeletingUrls(prev => prev.filter(url => url !== imageUrl));
  }
};


  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {images.map((image, index) => (
        <motion.div
          key={image.url}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.05 }}
          whileHover={{ scale: 1.06 }}
          className="group relative aspect-square rounded-xl overflow-hidden
                     bg-white/5 backdrop-blur-xl border border-cyan-400/20
                     shadow-[0_0_30px_rgba(34,211,238,0.15)]"
        >
          <img
            src={image.url}
            alt={image.name}
            className="w-full h-full object-cover"
          />

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent
                          opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <div className="text-sm truncate text-white mb-1">
                {image.name}
              </div>
              <div className="text-xs text-cyan-200">
                {image.size} KB
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleDelete(image.url)}
              disabled={deletingUrls.includes(image.url)}
              className={`absolute top-2 right-2 p-2 rounded-lg z-20
                shadow-[0_0_15px_rgba(239,68,68,0.8)]
                ${
                  deletingUrls.includes(image.url)
                    ? 'bg-gray-500 cursor-not-allowed'
                    : 'bg-red-500/90 hover:bg-red-600'
                }`}
            >
              <Trash2 className="w-4 h-4 text-white" />
            </motion.button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
