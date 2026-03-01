import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useMutation } from '@tanstack/react-query';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Use React Query mutation for contact form submission
  const contactMutation = useMutation({
    mutationFn: async (formData: { name: string; email: string; message: string }) => {
      const { error } = await supabase
        .from('contact_submissions')
        .insert([formData]);
      
      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      setSuccessMessage('Your message has been sent successfully!');
      setName('');
      setEmail('');
      setMessage('');
      setErrorMessage('');
    },
    onError: (error: any) => {
      console.error('Error sending message:', error);
      setErrorMessage('Failed to send message. Please try again.');
      setSuccessMessage('');
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!name || !email || !message) {
      setErrorMessage('Please fill in all fields.');
      return;
    }

    if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    contactMutation.mutate({ name, email, message });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative">
        <picture>
          <source
            media="(min-width: 1280px)"
            srcSet="https://images.pexels.com/photos/1367242/pexels-photo-1367242.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&dpr=1"
          />
          <source
            media="(min-width: 768px)"
            srcSet="https://images.pexels.com/photos/1367242/pexels-photo-1367242.jpeg?auto=compress&cs=tinysrgb&w=1280&h=720&dpr=1"
          />
          <img
            src="https://images.pexels.com/photos/1367242/pexels-photo-1367242.jpeg?auto=compress&cs=tinysrgb&w=640&h=480&dpr=1"
            alt="A lush green valley with a river running through it"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </picture>
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div className="relative z-10 min-h-[500px] flex items-center justify-center">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white dark:text-white mb-6 leading-tight">
              Contact Us
            </h1>
            <p className="text-lg md:text-xl text-gray-200 dark:text-gray-200 mb-8 max-w-2xl mx-auto leading-relaxed">
              We'd love to hear from you! Whether you have a question about our products, need assistance with an order, or just want to say hello, please don't hesitate to get in touch.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form and Details Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-lg shadow-lg">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Send us a message</h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <label htmlFor="name" className="block text-gray-700 dark:text-gray-200 font-medium mb-2">Full Name</label>
                  <input type="text" id="name" name="name" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="Your Name" />
                </div>
                <div className="mb-6">
                  <label htmlFor="email" className="block text-gray-700 dark:text-gray-200 font-medium mb-2">Email Address</label>
                  <input type="email" id="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="your.email@example.com" />
                </div>
                <div className="mb-6">
                  <label htmlFor="message" className="block text-gray-700 dark:text-gray-200 font-medium mb-2">Message</label>
                  <textarea id="message" name="message" rows={5} value={message} onChange={(e) => setMessage(e.target.value)} className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="How can we help you?"></textarea>
                </div>
                {errorMessage && (
                  <p className="text-red-500 dark:text-red-400 text-sm mb-4">{errorMessage}</p>
                )}
                {successMessage && (
                  <p className="text-green-600 dark:text-green-400 text-sm mb-4">{successMessage}</p>
                )}
                <button 
                  type="submit" 
                  disabled={contactMutation.isPending}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  {contactMutation.isPending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Contact Details */}
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Contact Information</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  You can also reach us through the following channels. We look forward to connecting with you!
                </p>
              </div>
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
                  <Mail className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Email</h4>
                  <p className="text-gray-600 dark:text-gray-300">support@freshshroom.com</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
                  <Phone className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Phone</h4>
                  <p className="text-gray-600 dark:text-gray-300">(123) 456-7890</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Address</h4>
                  <p className="text-gray-600 dark:text-gray-300">123 Mushroom Lane, Sporeville, OR 97123</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}