'use client';

import { useEffect, useState } from 'react';
import { Loader } from 'lucide-react';

const DEFAULT_MILESTONES = [
  { year: '2010', title: 'Company Founded', description: 'Modest Cargo was established to deliver quality engineering solutions across industrial and commercial sectors.' },
  { year: '2013', title: 'First Major Industrial Project', description: 'Completed our first large-scale industrial plant project, setting a standard for quality and efficiency.' },
  { year: '2016', title: 'Expansion of Services', description: 'Expanded our service portfolio to include mechanical works and electrical installations.' },
  { year: '2019', title: 'Award Recognition', description: 'Received industry awards for excellence in engineering and project management.' },
  { year: '2023', title: 'Global Partnerships', description: 'Established partnerships with international firms, enhancing our global project reach.' },
];

export default function HistoryMilestones() {
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMilestones = async () => {
      try {
        const response = await fetch('/api/milestones');
        const data = await response.json();

        if (data.success && data.milestones) {
          const sortedMilestones = [...data.milestones].sort((a, b) => (a.order || 0) - (b.order || 0));
          setMilestones(sortedMilestones);
        }
      } catch (error) {
        console.error('Failed to fetch milestones:', error);
        setMilestones(DEFAULT_MILESTONES);
      } finally {
        setLoading(false);
      }
    };

    fetchMilestones();
  }, []);

  if (loading) {
    return (
      <section className="bg-white py-16">
        <div className="container mx-auto px-6 lg:px-20 flex items-center justify-center min-h-96">
          <Loader className="w-8 h-8 animate-spin text-blue-900" />
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white py-16">
      <div className="container mx-auto px-6 lg:px-20">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">Our History & Milestones</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Over the years, Modest Cargo has achieved significant milestones that reflect our commitment to excellence and innovation.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative border-l-2 border-blue-900 ml-4 md:ml-12">
          {milestones.map((milestone, index) => (
            <div key={index} className="mb-10 ml-6 md:ml-12 relative">
              {/* Dot */}
              <span className="absolute -left-4 md:-left-6 w-4 h-4 bg-blue-900 rounded-full top-1.5 md:top-2"></span>
              
              {/* Content */}
              <div>
                <h3 className="text-xl font-semibold text-gray-800">{milestone.year} - {milestone.title}</h3>
                <p className="text-gray-600 mt-2">{milestone.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
