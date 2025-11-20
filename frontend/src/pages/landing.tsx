import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-600/10 rounded-full blur-3xl animate-pulse delay-700"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          {/* Badge */}
          <div className="inline-block animate-fade-in">
            <div className="px-6 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full">
              <span className="text-sm font-medium text-orange-400">
                Risk Assessment Platform
              </span>
            </div>
          </div>

          {/* Main Headline */}
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold leading-tight animate-fade-in-up">
            Calculate Your
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">
              Project Risk
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto animate-fade-in-up delay-200">
            Make data-driven decisions with our advanced risk assessment tools.
            Analyze your project metrics and get actionable insights in seconds.
          </p>

          {/* CTA Button */}
          <div className="pt-8 animate-fade-in-up delay-400">
            <Link to="/input">
              <Button
                size="lg"
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold px-12 py-7 text-xl shadow-2xl hover:shadow-orange-500/50 transition-all duration-300 rounded-xl group"
              >
                Get Started
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="ml-3 group-hover:translate-x-1 transition-transform"
                >
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </Button>
            </Link>
          </div>

          {/* Stats or Features */}
          <div className="pt-16 grid grid-cols-3 gap-8 max-w-3xl mx-auto animate-fade-in-up delay-600">
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-500 mb-2">27+</div>
              <div className="text-sm text-gray-400">Risk Metrics</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-500 mb-2">
                100%
              </div>
              <div className="text-sm text-gray-400">Data Driven</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-500 mb-2">⚡</div>
              <div className="text-sm text-gray-400">Instant Results</div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000,transparent)]"></div>
    </div>
  );
}
