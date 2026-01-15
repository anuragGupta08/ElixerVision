import { motion } from 'framer-motion';
import { Trash2, Sparkles } from 'lucide-react';
import type { DuplicateGroup } from '../pages/Dashboard';

interface DuplicateGroupsProps {
  groups: DuplicateGroup[];
  onDeleteImage: (imageUrl: string) => void;
}

export function DuplicateGroups({ groups, onDeleteImage }: DuplicateGroupsProps) {
  const handleDelete = (imageUrl: string) => {
    onDeleteImage(imageUrl);
  };

  // ✅ EMPTY STATE
  if (!groups.length) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center text-center py-20"
      >
        <Sparkles className="w-12 h-12 text-cyan-300 mb-4" />
        <h2 className="text-2xl font-semibold text-white">
          No duplicates found 🎉
        </h2>
        <p className="text-cyan-200 mt-2">
          Your storage is already optimized.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-10">
      {groups.map((group, groupIndex) => (
        <motion.div
          key={group.id}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: groupIndex * 0.12 }}
          className="relative rounded-2xl p-6 bg-white/5 backdrop-blur-xl border border-cyan-400/20 shadow-[0_0_40px_rgba(34,211,238,0.15)]"
        >
          {/* Header */}
          <div className="flex items-center gap-3 mb-5">
            <Sparkles className="w-6 h-6 text-cyan-300" />
            <div>
              <h3 className="text-xl font-semibold text-white">
                Duplicate Group {groupIndex + 1}
              </h3>
              <p className="text-sm text-cyan-200/80">
                Similarity: {group.similarity}% • {group.images.length} images
              </p>
            </div>
          </div>

          {/* Images */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {group.images.map((image, imageIndex) => {
              const isBest = image.url === group.bestImageId;

              return (
                <motion.div
                  key={image.url}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: imageIndex * 0.06 }}
                  whileHover={
                    isBest
                      ? { scale: 1.08 }
                      : { scale: 1.06 }
                  }
                  className={`group relative aspect-square rounded-xl overflow-hidden border ${
                    isBest
                      ? 'border-cyan-400/60'
                      : 'border-white/10'
                  }`}
                >
                  {/* 🔥 BEST IMAGE — NEON GLOW */}
                  {isBest && (
                    <>
                      <motion.div
                        initial={{ opacity: 0.7 }}
                        animate={{ opacity: [0.6, 1, 0.6] }}
                        transition={{
                          duration: 1.8,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                        className="pointer-events-none absolute -inset-1 rounded-xl"
                        style={{
                          boxShadow: `
                            0 0 25px rgba(34,211,238,1),
                            0 0 60px rgba(34,211,238,0.9),
                            0 0 120px rgba(34,211,238,0.8)
                          `,
                        }}
                      />

                      <div
                        className="pointer-events-none absolute inset-0 rounded-xl border-2 border-cyan-300"
                        style={{
                          boxShadow: `
                            inset 0 0 30px rgba(34,211,238,1),
                            inset 0 0 18px rgba(34,211,238,0.9)
                          `,
                        }}
                      />
                    </>
                  )}

                  <img
                    src={image.url}
                    alt={image.name}
                    className="w-full h-full object-cover"
                  />

                  {/* 🗑 DELETE BUTTON — NON-BEST ONLY */}
                  {!isBest && (
                    <motion.button
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDelete(image.url)}
                      className="absolute top-2 right-2 z-20 p-2 rounded-lg bg-red-500/90 hover:bg-red-600 shadow-lg opacity-0 group-hover:opacity-100 transition"
                    >
                      <Trash2 className="w-4 h-4 text-white" />
                    </motion.button>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Info */}
          <div className="mt-5 p-4 rounded-xl bg-cyan-500/10 border border-cyan-400/20">
            <p className="text-sm text-cyan-200">
              💡 The glowing image is selected as the best. You can safely delete the others.
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
