import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface WorkItem {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  cover: string | null;
  outcome: string | null;
  role: string | null;
}

interface Props {
  works: WorkItem[];
  allTags: string[];
}

export default function PortfolioGrid({ works, allTags }: Props) {
  const [activeTag, setActiveTag] = useState('All');

  const filtered = activeTag === 'All' ? works : works.filter((w) => w.tags.includes(activeTag));

  return (
    <div>
      {/* Filter pills */}
      <div className="flex flex-wrap gap-2 mb-10">
        {allTags.map((tag) => (
          <button
            key={tag}
            onClick={() => setActiveTag(tag)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeTag === tag
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Grid */}
      <motion.div layout className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filtered.map((work) => (
            <motion.a
              key={work.slug}
              href={`/work/${work.slug}`}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="group block bg-white border border-gray-100 rounded-2xl overflow-hidden hover:border-gray-300 hover:shadow-lg transition-shadow duration-300"
            >
              {work.cover && (
                <div className="aspect-video bg-gray-50 overflow-hidden">
                  <img
                    src={work.cover}
                    alt={work.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              )}
              <div className="p-6">
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {work.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-sky-600 transition-colors">
                  {work.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-4">
                  {work.description}
                </p>
                {work.outcome && (
                  <p className="text-xs font-medium text-sky-600">{work.outcome}</p>
                )}
              </div>
            </motion.a>
          ))}
        </AnimatePresence>
      </motion.div>

      {filtered.length === 0 && (
        <p className="text-gray-400 text-sm py-12 text-center">No work matching this filter.</p>
      )}
    </div>
  );
}
