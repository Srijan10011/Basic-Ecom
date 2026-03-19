import React from 'react';
import { Star } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'Sarah Johnson',
    location: 'San Francisco, CA',
    initials: 'SJ',
    rating: 5,
    text: 'The quality of their dried mushrooms is exceptional! The flavor is so rich and they rehydrate perfectly. I\'ve been ordering from FreshShroom for over a year now.'
  },
  {
    id: 2,
    name: 'Michael Chen',
    location: 'Portland, OR',
    initials: 'MC',
    rating: 5,
    text: 'Growing my own mushrooms has been such a rewarding experience! The cultivation kit was easy to use, and the customer support was incredibly helpful throughout the process.'
  },
  {
    id: 3,
    name: 'Emily Rodriguez',
    location: 'Austin, TX',
    initials: 'ER',
    rating: 5,
    text: 'Fast shipping, excellent packaging, and the freshest mushrooms I\'ve ever received online. FreshShroom has become my go-to source for all mushroom products.'
  }
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex mb-4">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-5 w-5 sm:h-6 sm:w-6 ${
            star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  );
}

export default function Testimonials() {
  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            What Our Customers Say
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust A and C Mushroom for their
            mushroom needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-8 hover:shadow-lg transition-shadow">
              <StarRating rating={testimonial.rating} />
              <p className="text-gray-700 dark:text-gray-200 mb-6 leading-relaxed italic">
                "{testimonial.text}"
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center mr-4">
                  <span className="text-green-600 font-semibold text-sm">
                    {testimonial.initials}
                  </span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">{testimonial.name}</div>
                  <div className="text-gray-600 dark:text-gray-300 text-sm">{testimonial.location}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}