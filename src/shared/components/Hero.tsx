import React from 'react';
import { Session } from '@supabase/supabase-js';

interface HeroProps {
  setCurrentPage: (page: string) => void;
  setModal: (modal: 'login' | 'signup' | null) => void;
  session: Session | null;
}

export default function Hero({ setCurrentPage, setModal, session }: HeroProps) {
  return (
    <section className="relative">
      <picture>
        <source
          media="(min-width: 1280px)"
          srcSet="https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=1"
        />
        <source
          media="(min-width: 768px)"
          srcSet="https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=1280&h=720&dpr=1"
        />
        <img
          src="https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=640&h=480&dpr=1"
          alt="A lush green valley with a river running through it"
          className="absolute inset-0 w-full h-full object-cover"
        />
      </picture>
      <div className="absolute inset-0 bg-black opacity-30"></div>
      <div className="relative z-10 min-h-[600px] flex items-center justify-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-white dark:text-white mb-6 leading-tight">
            Fresh, Organic<br />
            Mushrooms <span className="text-orange-400">From Farm<br />
            to Home</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-200 dark:text-gray-200 mb-8 max-w-2xl mx-auto leading-relaxed">
            Discover premium quality dried mushrooms, spawn seeds, and
            cultivation kits. Grown with love, delivered with care.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {session ? (
              <button
                onClick={() => setCurrentPage('shop')}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors transform hover:scale-105"
              >
                Shop Now
              </button>
            ) : (
              <>
                <button
                  onClick={() => setModal('signup')}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors transform hover:scale-105"
                >
                  Get Started
                </button>
                <button
                  onClick={() => setCurrentPage('about')}
                  className="bg-white hover:bg-gray-50 text-gray-900 px-8 py-3 rounded-lg font-semibold border transition-colors"
                >
                  Learn More
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}