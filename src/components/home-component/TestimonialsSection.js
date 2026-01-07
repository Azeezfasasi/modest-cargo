'use client';

import { Star, Loader } from "lucide-react";
import { useEffect, useState } from "react";

const DEFAULT_TESTIMONIALS = [
  {
    id: 1,
    name: "John Adewale",
    position: "Project Manager, Alpha Industries",
    message:
      "Modest Cargo delivered beyond expectations. Their team showed exceptional professionalism and technical expertise throughout our factory upgrade project.",
    rating: 5,
  },
  {
    id: 2,
    name: "Maria Okafor",
    position: "Director, GreenBuild Ltd.",
    message:
      "The Modest Cargo team provided innovative solutions that reduced our construction costs and improved overall efficiency. Highly recommended for quality engineering services.",
    rating: 5,
  },
  {
    id: 3,
    name: "Engr. David Uche",
    position: "CEO, Uche Group",
    message:
      "They combine strong technical skills with a great sense of client service. Every project we’ve done with Modest Cargo has been a success story.",    rating: 5,  },
];

export default function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await fetch('/api/testimonials');
        const data = await response.json();

        if (data.success && data.testimonials) {
          const sortedTestimonials = [...data.testimonials].sort((a, b) => (a.order || 0) - (b.order || 0));
          setTestimonials(sortedTestimonials);
        }
      } catch (error) {
        console.error('Failed to fetch testimonials:', error);
        setTestimonials(DEFAULT_TESTIMONIALS);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  if (loading) {
    return (
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-6 lg:px-20 flex items-center justify-center min-h-64">
          <Loader className="w-8 h-8 animate-spin text-red-700" />
        </div>
      </section>
    );
  }

  return (
    <section className="bg-gray-50 py-16">
      <div className="container mx-auto px-6 lg:px-20">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
            What Our Clients Say
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Hear from some of our satisfied clients who have trusted Modest Cargo with their projects.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial._id || testimonial.id}
              className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition"
            >
              {/* Stars */}
              <div className="flex gap-1 text-yellow-500 mb-4">
                {[...Array(testimonial.rating || 5)].map((_, i) => (
                  <Star key={i} size={18} fill="currentColor" />
                ))}
              </div>

              {/* Message */}
              <p className="text-gray-600 mb-6 italic">
                “{testimonial.message}”
              </p>

              {/* Author */}
              <div>
                <h4 className="text-lg font-semibold text-gray-800">
                  {testimonial.name}
                </h4>
                <p className="text-sm text-gray-500">{testimonial.position}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <a
            href="/contact-us"
            className="inline-block bg-red-700 text-white px-8 py-3 rounded-lg shadow hover:bg-red-800 transition"
          >
            Work With Us
          </a>
        </div>
      </div>
    </section>
  );
}
