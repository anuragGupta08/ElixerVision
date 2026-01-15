import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Sparkles, LogOut, Upload, FolderUp, Search, Star, HardDrive 
} from 'lucide-react';
import { AnimatedBackground } from '../components/AnimatedBackground';
import { ImageGallery } from '../components/ImageGallery';
import { DuplicateGroups } from '../components/DuplicateGroups';
import api from '../api/axios';

interface DashboardProps {
  userName: string;
  onLogout: () => void;
}

export interface ImageData {
  id: string;
  url: string;
  name: string;
  size: number; // KB
  resolution: string;
}

export interface DuplicateGroup {
  id: string;
  images: ImageData[];
  similarity: number;
  bestImageId: string; // URL of best image
}

export default function Dashboard({ userName, onLogout }: DashboardProps) {
  const [images, setImages] = useState<ImageData[]>([]);
  const [duplicateGroups, setDuplicateGroups] = useState<DuplicateGroup[]>([]);
  const [showDuplicates, setShowDuplicates] = useState(false);
  const [storageSaved, setStorageSaved] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Helper: fetch actual image size from URL
  const fetchImageSize = async (url: string) => {
    try {
      const res = await fetch(url, { method: 'HEAD' });
      const sizeBytes = Number(res.headers.get('Content-Length') || 0);
      return Math.round(sizeBytes / 1024); // KB
    } catch (err) {
      console.error('Failed to fetch size for', url, err);
      return 0;
    }
  };

  // Fetch images on mount with actual sizes
  useEffect(() => {
    const fetchImages = async () => {
      try {
        setLoading(true);
        const res = await api.get('/images');

        // Fetch sizes concurrently for faster loading
        const imagesData: ImageData[] = await Promise.all(
          res.data.images.map(async (img: any) => ({
            id: crypto.randomUUID(),
            url: img.url,
            name: img.name || img.url.split('/').pop() || 'Unknown',
            size: img.size ?? 0,
            resolution: img.resolution || 'Unknown',
          }))
        );

        setImages(imagesData);
      } catch (err) {
        console.error('Failed to fetch images', err);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  // Upload images with actual sizes
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = e.target.files;
  if (!files || files.length === 0) return;

  const formData = new FormData();
  Array.from(files).forEach(file => formData.append('files', file));

  try {
    setLoading(true);
    const res = await api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    const uploadedFiles = res.data?.files || res.data?.urls || [];

    if (uploadedFiles.length === 0) {
      console.warn('No files returned from upload');
    }

    const uploadedImages: ImageData[] = uploadedFiles.map((item: any) => {
      const url = typeof item === 'string' ? item : item.url;
      const name = typeof item === 'string' ? url.split('/').pop() || 'Unknown' : item.name || url.split('/').pop() || 'Unknown';
      return {
        id: crypto.randomUUID(),
        url,
        name,
        size: typeof item === 'string' ? 0 : item.size ?? 0,
        resolution: 'Unknown',
      };
    });

    setImages(prev => [...prev, ...uploadedImages]);
  } catch (err) {
    console.error('Upload failed', err);
    alert('Image upload failed');
  } finally {
    setLoading(false);
  }
};


  // Find duplicates
  const findDuplicates = async () => {
    if (images.length < 2) {
      alert('Upload at least 2 images to find duplicates');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/duplicates');
      console.log('Duplicate response:', res.data); // debug

      const groups: DuplicateGroup[] = res.data.duplicate_groups.map((g: any) => ({
        id: crypto.randomUUID(),
        images: g.images.map((img: string) => ({
          id: crypto.randomUUID(),
          url: img,
          name: img.split('/').pop() || 'Unknown',
          size: 0, // backend does not send size
          resolution: 'Unknown', // backend does not send resolution
        })),
        similarity: g.max_similarity || 0,
        bestImageId: g.best_image, // URL
      }));

      setDuplicateGroups(groups);
      setShowDuplicates(true);
    } catch (err) {
      console.error('Failed to fetch duplicates', err);
      alert('Failed to find duplicates');
    } finally {
      setLoading(false);
    }
  };

  // Delete image and update storageSaved
  const handleDeleteImage = async (imageUrl: string) => {
    const prevImages = [...images];
    const prevGroups = [...duplicateGroups];
    const deletedImage = images.find(img => img.url === imageUrl);

    setImages(prev => prev.filter(img => img.url !== imageUrl));

    setDuplicateGroups(prev =>
      prev
        .map(group => {
          const remaining = group.images.filter(img => img.url !== imageUrl);
          if (remaining.length < 2) return null;

          const bestStillExists = remaining.some(img => img.url === group.bestImageId);
          return {
            ...group,
            images: remaining,
            bestImageId: bestStillExists ? group.bestImageId : remaining[0].url,
          };
        })
        .filter(Boolean) as DuplicateGroup[]
    );

    if (deletedImage) {
      setStorageSaved(prev => prev + deletedImage.size);
    }

    try {
      await api.delete('/duplicates/delete', { params: { image_url: imageUrl } });
    } catch (err) {
      console.error('Delete failed', err);
      setImages(prevImages);
      setDuplicateGroups(prevGroups);
      if (deletedImage) setStorageSaved(prev => prev - deletedImage.size);
      alert('Failed to delete image');
    }
  };

  // Calculate total storage
  const totalStorage = images.reduce((sum, img) => sum + img.size, 0);

  return (
    <div className="min-h-screen text-white relative">
      <AnimatedBackground />

      {/* Navigation */}
      <nav className="relative z-10 px-6 py-6 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-purple-200" />
            <span className="text-2xl font-semibold">Elixer Vision</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-purple-100">Welcome, {userName}</span>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={()=>{
                onLogout();
                navigate('/');
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </motion.button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Stats */}
          <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Total Storage */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <div className="flex items-center gap-3">
                <HardDrive className="w-8 h-8 text-purple-200" />
                <div>
                  <div className="text-sm text-purple-100">Total Storage</div>
                  <div className="text-2xl">{totalStorage} KB</div>
                </div>
              </div>
            </motion.div>

            {/* Storage Saved */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <div className="flex items-center gap-3">
                <Star className="w-8 h-8 text-yellow-300" />
                <div>
                  <div className="text-sm text-purple-100">Storage Saved</div>
                  <div className="text-2xl">{storageSaved} KB</div>
                </div>
              </div>
            </motion.div>

            {/* Total Images */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <div className="flex items-center gap-3">
                <Upload className="w-8 h-8 text-purple-200" />
                <div>
                  <div className="text-sm text-purple-100">Total Images</div>
                  <div className="text-2xl">{images.length}</div>
                </div>
              </div>
            </motion.div>

            {/* Duplicate Groups */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <div className="flex items-center gap-3">
                <Search className="w-8 h-8 text-purple-200" />
                <div>
                  <div className="text-sm text-purple-100">Duplicate Groups</div>
                  <div className="text-2xl">{duplicateGroups.length}</div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Actions */}
          <div className="mb-8 flex flex-wrap gap-4">
            <motion.label className="cursor-pointer" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <input type="file" multiple accept="image/*" onChange={handleFileUpload} className="hidden" />
              <div className="flex items-center gap-2 px-6 py-3 rounded-lg bg-white text-purple-900 shadow-lg hover:shadow-xl transition-all">
                <Upload className="w-5 h-5" />
                Upload Images
              </div>
            </motion.label>

            <motion.label className="cursor-pointer" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <input type="file" multiple accept="image/*" webkitdirectory="true" onChange={handleFileUpload} className="hidden" />
              <div className="flex items-center gap-2 px-6 py-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all">
                <FolderUp className="w-5 h-5" />
                Upload Folder
              </div>
            </motion.label>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={findDuplicates}
              disabled={images.length < 2}
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-purple-500 hover:bg-purple-600 disabled:bg-gray-500 disabled:cursor-not-allowed transition-all shadow-lg"
            >
              <Search className="w-5 h-5" />
              Find Duplicates
            </motion.button>

            {showDuplicates && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowDuplicates(false)}
                className="flex items-center gap-2 px-6 py-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all"
              >
                Show All Images
              </motion.button>
            )}
          </div>

          {/* Gallery / Duplicates */}
          {loading ? (
            <p className="text-center text-purple-200">Loading...</p>
          ) : showDuplicates && duplicateGroups.length > 0 ? (
            <DuplicateGroups groups={duplicateGroups} onDeleteImage={handleDeleteImage} />
          ) : (
            <ImageGallery images={images} onDeleteImage={handleDeleteImage} />
          )}

          {/* Empty State */}
          {images.length === 0 && !loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
              <Upload className="w-16 h-16 mx-auto mb-4 text-purple-200" />
              <h3 className="text-2xl mb-2">No images yet</h3>
              <p className="text-purple-100">Upload some images to get started</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
