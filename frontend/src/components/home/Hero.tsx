import Link from 'next/link';

export default function Hero() {
  return (
    <div className="relative bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
              Transform Your Ideas Into Reality
            </h1>
            <p className="mt-6 text-lg text-gray-600">
              We help businesses leverage cutting-edge technology to stay ahead in the digital age. 
              Experience innovation that drives results.
            </p>
            <div className="mt-8 flex gap-4">
              <Link
                href="#contact"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Get Started
              </Link>
              <Link
                href="#features"
                className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Learn More
              </Link>
            </div>
          </div>

          {/* Stats/Numbers */}
          <div className="grid grid-cols-2 gap-8 mt-8 md:mt-0">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600">500+</div>
              <div className="mt-2 text-gray-600">Projects Completed</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600">98%</div>
              <div className="mt-2 text-gray-600">Client Satisfaction</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600">24/7</div>
              <div className="mt-2 text-gray-600">Support Available</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600">10+</div>
              <div className="mt-2 text-gray-600">Years Experience</div>
            </div>
          </div>
        </div>

        {/* Optional: Trusted By Section */}
        <div className="mt-16">
          <p className="text-center text-sm font-semibold text-gray-500 uppercase tracking-wide">
            Trusted by industry leaders
          </p>
          <div className="mt-8 grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
            {/* Add company logos here */}
          </div>
        </div>
      </div>
    </div>
  );
}
