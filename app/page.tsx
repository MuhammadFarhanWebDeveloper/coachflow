"use client";

import { useState } from "react";
import Link from "next/link";
import { SignInButton, SignUpButton, UserButton, Show } from "@clerk/nextjs";
import {
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  Users,
  BarChart3,
  MessageSquare,
} from "lucide-react";

export default function LandingPage() {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  const features = [
    {
      icon: MessageSquare,
      title: "Weekly Check-ins",
      description:
        "Clients submit simple weekly progress updates automatically",
    },
    {
      icon: TrendingUp,
      title: "Progress Tracking",
      description:
        "Visual charts and metrics to track weight, measurements, and compliance",
    },
    {
      icon: Users,
      title: "Client Dashboard",
      description:
        "Simple, distraction-free interface for clients to submit updates",
    },
    {
      icon: BarChart3,
      title: "Coach Dashboard",
      description:
        "Complete overview of all clients, pending check-ins, and trends",
    },
  ];

  const testimonials = [
    {
      text: "CoachFlow saves me hours every week chasing clients on WhatsApp. Finally a tool built for coaches.",
      author: "Sarah Chen",
      role: "Online Fitness Coach",
      image:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
    },
    {
      text: "My clients love how simple it is to submit their weekly check-ins. The progress charts are incredible.",
      author: "Mike Rodriguez",
      role: "Personal Training Business Owner",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    },
    {
      text: "The compliance tracking actually shows me which clients are consistent. Game changer for accountability.",
      author: "Emma Johnson",
      role: "Transformation Coach",
      image:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
    },
  ];

  const steps = [
    {
      number: 1,
      title: "Create Account",
      description: "Set up your coach workspace in seconds",
    },
    {
      number: 2,
      title: "Invite Clients",
      description: "Send invitations to your existing clients",
    },
    {
      number: 3,
      title: "Set Reminders",
      description: "Clients receive weekly check-in reminders",
    },
    {
      number: 4,
      title: "Collect Data",
      description: "Clients submit progress, photos, and metrics",
    },
    {
      number: 5,
      title: "Review Progress",
      description: "See all client data in one dashboard",
    },
    {
      number: 6,
      title: "Leave Feedback",
      description: "Provide coaching feedback directly in CoachFlow",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-gray-900">
            Coach<span className="text-green-500">Flow</span>
          </div>
          <div className="hidden md:flex gap-8">
            <a href="#features" className="text-gray-600 hover:text-gray-900">
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-gray-600 hover:text-gray-900"
            >
              How it works
            </a>
            <a href="#pricing" className="text-gray-600 hover:text-gray-900">
              Pricing
            </a>
          </div>
          <div className="flex gap-4 items-center">
            <Show when="signed-out">
              <SignInButton>
                <button className="px-4 py-2 text-green-600 hover:text-green-700 font-medium cursor-pointer">
                  Log in
                </button>
              </SignInButton>
              <SignUpButton>
                <button className="px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition cursor-pointer">
                  Start Free Demo
                </button>
              </SignUpButton>
            </Show>
            <Show when="signed-in">
              <Link
                href="/dashboard"
                className="px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition"
              >
                Dashboard
              </Link>
              <UserButton />
            </Show>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Stop chasing client check-ins on WhatsApp.
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              CoachFlow helps online fitness coaches collect weekly check-ins,
              track progress, and manage clients in one simple place. Focus on
              coaching, not admin.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <SignUpButton>
                <button className="inline-flex items-center justify-center px-6 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition gap-2 cursor-pointer">
                  Start Free Demo
                  <ArrowRight size={20} />
                </button>
              </SignUpButton>
              <button className="inline-flex items-center justify-center px-6 py-3 border-2 border-gray-300 text-gray-900 font-semibold rounded-lg hover:border-gray-400 transition">
                View Demo
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-6">
              No credit card required. 14-day free trial.
            </p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-gray-50 rounded-2xl p-8 border border-gray-200">
            <div className="space-y-4">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-green-500"></div>
                  <div className="text-sm font-medium text-gray-900">
                    Ahmed submitted check-in
                  </div>
                </div>
                <div className="text-xs text-gray-500 pl-13">
                  Current weight: 82kg, Energy: 8/10
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500"></div>
                  <div className="text-sm font-medium text-gray-900">
                    Sarah uploaded photos
                  </div>
                </div>
                <div className="text-xs text-gray-500 pl-13">
                  Week 4 progress photos ready
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-orange-500"></div>
                  <div className="text-sm font-medium text-gray-900">
                    Ali needs follow-up
                  </div>
                </div>
                <div className="text-xs text-gray-500 pl-13">
                  Missed this week&apos;s check-in
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything a fitness coach needs
            </h2>
            <p className="text-xl text-gray-600">
              Focus on coaching, not admin work
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  onMouseEnter={() => setHoveredFeature(idx)}
                  onMouseLeave={() => setHoveredFeature(null)}
                  className="bg-white rounded-xl p-8 border border-gray-200 hover:shadow-lg hover:border-green-200 transition cursor-pointer group"
                >
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-500 transition">
                    <Icon
                      className={`${hoveredFeature === idx ? "text-white" : "text-green-600"} transition`}
                      size={24}
                    />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Simple workflow
            </h2>
            <p className="text-xl text-gray-600">
              Get up and running in minutes
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step) => (
              <div key={step.number} className="relative">
                <div className="bg-white rounded-xl p-8 border border-gray-200 h-full">
                  <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-lg mb-4">
                    {step.number}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
                {step.number < 6 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="text-gray-300" size={24} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Loved by coaches
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl p-8 border border-gray-200"
              >
                <div className="flex items-center gap-4 mb-6">
                  <img
                    src={testimonial.image}
                    alt={testimonial.author}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-gray-900">
                      {testimonial.author}
                    </p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  &ldquo;{testimonial.text}&rdquo;
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Simple pricing
            </h2>
            <p className="text-xl text-gray-600">
              No setup fees. Cancel anytime.
            </p>
          </div>
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl p-12 border-2 border-green-200 shadow-lg">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  CoachFlow Pro
                </h3>
                <p className="text-gray-600">
                  Everything you need to manage your clients
                </p>
              </div>
              <div className="text-center mb-12">
                <div className="text-5xl font-bold text-gray-900 mb-2">
                  $49<span className="text-xl text-gray-500">/month</span>
                </div>
                <p className="text-gray-500">per coach workspace</p>
              </div>
              <div className="space-y-4 mb-12">
                {[
                  "Unlimited clients",
                  "Weekly check-in collection",
                  "Progress tracking with charts",
                  "Progress photo uploads",
                  "Client compliance tracking",
                  "Coach feedback system",
                  "Mobile-responsive interface",
                  "24/7 support",
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <CheckCircle2
                      size={20}
                      className="text-green-500 flex-shrink-0"
                    />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
              <SignUpButton>
                <button className="w-full inline-flex items-center justify-center px-6 py-4 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition cursor-pointer">
                  Start Free Trial
                </button>
              </SignUpButton>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="text-2xl font-bold text-white mb-4">
                Coach<span className="text-green-500">Flow</span>
              </div>
              <p className="text-sm">
                The simple way for coaches to collect weekly check-ins and track
                progress.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#features" className="hover:text-white transition">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="hover:text-white transition">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Security
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Terms
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2024 CoachFlow. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
