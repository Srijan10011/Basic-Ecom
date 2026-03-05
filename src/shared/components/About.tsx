
import { Check, Users, Award, Leaf, Heart, Globe } from 'lucide-react';

const certifications = [
  '100% Organic Certification',
  'Sustainable Farming Practices',
  'Fresh Harvest Guarantee',
  'Expert Cultivation Support',
  
];

const stats = [
  { number: '20+', label: 'Years of Experience' },
  { number: '10,000+', label: 'Happy Customers' },
  { number: '50+', label: 'Mushroom Varieties' },
  { number: '100%', label: 'Organic Certified' }
  
];

const teamMembers = [
  {
    name: 'Sarah Mitchell',
    role: 'Founder & Head Cultivator OOh yea',
    initials: 'PM',
    description: 'With over 25 years in organic farming, Sarah founded FreshShroom with a vision to bring premium mushrooms to every table.'
  },
  {
    name: 'David Chen',
    role: 'Mycologist & Quality Director',
    initials: 'DC',
    description: 'David ensures every mushroom meets our highest standards through scientific cultivation methods and quality control.'
  },
  {
    name: 'Maria Rodriguez',
    role: 'Sustainability Manager',
    initials: 'MR',
    description: 'Maria leads our environmental initiatives, ensuring our farming practices protect and nurture the ecosystem.'
  }
];

const values = [
  {
    icon: <Leaf className="h-8 w-8 text-green-600" />,
    title: 'Sustainability First Really',
    description: 'We really believe in farming practices that regenerate the soil and protect our environment for future generations.'
  },
  {
    icon: <Heart className="h-8 w-8 text-green-600" />,
    title: 'Quality & Care',
    description: 'Every mushroom is cultivated with love and attention to detail, ensuring the highest quality reaches your table.'
  },
  {
    icon: <Users className="h-8 w-8 text-green-600" />,
    title: 'Community Focus',
    description: 'We support local communities and provide education on sustainable mushroom cultivation practices.'
  },
  {
    icon: <Globe className="h-8 w-8 text-green-600" />,
    title: 'Global Impact',
    description: 'Our mission extends beyond mushrooms - we\'re working to create a more sustainable food system worldwide.'
  }
];

export default function About({ setCurrentPage }: { setCurrentPage: (page: string) => void }) {
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
              Our Story
            </h1>
            <p className="text-lg md:text-xl text-gray-200 dark:text-gray-200 mb-8 max-w-2xl mx-auto leading-relaxed">
              From a small family farm to a trusted source of premium organic mushrooms, 
              discover the passion and dedication behind FreshShroom.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-green-600 dark:text-green-400 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 dark:text-gray-300 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Story Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                From Our Farm to Your Table
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                FreshShroom began in 1999 when Sarah Mitchell inherited her grandmother's small farm 
                in the rolling hills of Oregon. What started as a hobby growing shiitake mushrooms 
                in her backyard has grown into one of the most trusted organic mushroom suppliers 
                in the Pacific Northwest.
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                Our family-owned farm has been cultivating premium mushrooms for over two decades, 
                using sustainable farming practices that respect both nature and tradition. We believe 
                that the best mushrooms come from healthy soil, clean water, and careful attention 
                to every step of the growing process.
              </p>
              
              <div className="space-y-4 mb-8">
                {certifications.map((cert, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
                      <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-gray-700 dark:text-gray-200 font-medium">{cert}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="aspect-w-3 aspect-h-4">
                  <img 
                    src="https://images.pexels.com/photos/1367242/pexels-photo-1367242.jpeg?auto=compress&cs=tinysrgb&w=300&h=400&dpr=1"
                    alt="Fresh vegetables"
                    className="w-full h-full object-cover rounded-lg shadow-lg hover:shadow-xl transition-shadow"
                  />
                </div>
                <div className="aspect-w-3 aspect-h-2">
                  <img 
                    src="https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&dpr=1"
                    alt="Landscape"
                    className="w-full h-full object-cover rounded-lg shadow-lg hover:shadow-xl transition-shadow"
                  />
                </div>
              </div>
              <div className="mt-8">
                <div className="aspect-w-3 aspect-h-5">
                  <img 
                    src="https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=300&h=500&dpr=1"
                    alt="Mountain landscape"
                    className="w-full h-full object-cover rounded-lg shadow-lg hover:shadow-xl transition-shadow"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Our Values
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Everything we do is guided by our core values and commitment to excellence
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center p-6 rounded-xl bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                <div className="flex justify-center mb-4">
                  {value.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{value.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Meet Our Team
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              The passionate people behind FreshShroom who make our mission possible
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow text-center">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-green-600 dark:text-green-400 font-bold text-xl">
                    {member.initials}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{member.name}</h3>
                <p className="text-green-600 dark:text-green-400 font-medium mb-4">{member.role}</p>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{member.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-20 bg-green-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Award className="h-16 w-16 text-green-300 mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Our Mission
          </h2>
          <p className="text-xl text-green-100 leading-relaxed mb-8">
            "To cultivate the finest organic mushrooms while nurturing the earth and 
            supporting our community. We believe that sustainable farming practices 
            and genuine care for our customers create not just better mushrooms, 
            but a better world."
          </p>
          <div className="text-green-300 font-semibold">
            - Sarah Mitchell, Founder
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to Experience FreshShroom?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Join thousands of customers who trust us for their mushroom needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => setCurrentPage('shop')}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors transform hover:scale-105"
            >
              Shop Now
            </button>
            <button 
              onClick={() => setCurrentPage('contact')}
              className="bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-900 dark:text-white px-8 py-3 rounded-lg font-semibold border border-gray-300 dark:border-gray-600 transition-colors"
            >
              Contact Us
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}