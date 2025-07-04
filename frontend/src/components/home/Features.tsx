import { IconType } from 'react-icons';
import { 
  HiOutlineLightningBolt, 
  HiOutlineScale, 
  HiOutlineShieldCheck, 
  HiOutlineChartBar 
} from 'react-icons/hi';

const features = [
  {
    name: 'Lightning Fast',
    description: 'Our solutions are optimized for performance, ensuring quick load times and smooth user experiences.',
    icon: HiOutlineLightningBolt,
  },
  {
    name: 'Scalable Solutions',
    description: 'Built to grow with your business, our platform scales seamlessly as your needs evolve.',
    icon: HiOutlineScale,
  },
  {
    name: 'Enterprise Security',
    description: 'Top-tier security measures protect your data and ensure compliance with industry standards.',
    icon: HiOutlineShieldCheck,
  },
  {
    name: 'Analytics & Insights',
    description: 'Gain valuable insights through comprehensive analytics and reporting tools.',
    icon: HiOutlineChartBar,
  },
];

function FeatureCard({ name, description, icon: Icon }: { name: string; description: string; icon: IconType }) {
  return (
    <div className="relative p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 mb-4">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{name}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

export default function Features() {
  return (
    <div id="features" className="bg-gray-50 py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Features that Set Us Apart
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Our comprehensive suite of features helps you build, deploy, and scale your applications with confidence.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature) => (
            <FeatureCard
              key={feature.name}
              name={feature.name}
              description={feature.description}
              icon={feature.icon}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
