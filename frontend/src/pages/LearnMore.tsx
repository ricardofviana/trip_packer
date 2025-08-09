import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function LearnMorePage() {
  return (
    <main className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md mt-10">
      <h1 className="text-4xl font-extrabold text-blue-700 mb-6">Smart Luggage Manager</h1>

      <p className="text-lg text-gray-700 mb-8">
        <strong className="font-semibold">Goal:</strong> Empower travelers to pack efficiently by organizing items, tracking essentials, and preventing forgotten belongings.
      </p>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Key Features</h2>
        <ol className="list-decimal list-inside space-y-4 text-gray-700">
          <li>
            <strong className="text-blue-600">Predefined Templates</strong>
            <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
              <li><em>Trip-Specific Templates:</em> Ready-made packing lists for common trips like <span className="font-semibold">Beach Vacation</span>, <span className="font-semibold">Business Trip</span>, and <span className="font-semibold">Backpacking</span>.</li>
              <li><em>Customizable Templates:</em> Create and save your own packing lists for trips such as a <span className="font-semibold">Winter Ski Trip</span>.</li>
            </ul>
          </li>
          <li>
            <strong className="text-blue-600">Luggage Management</strong>
            <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
              <li><em>Multi-Bag Support:</em> Assign items to various bags like <span className="font-semibold">Suitcase</span>, <span className="font-semibold">Backpack</span>, or <span className="font-semibold">Toiletry Bag</span>.</li>
              <li><em>Weight Tracking (Optional):</em> Keep an eye on luggage weight to avoid airline fees.</li>
            </ul>
          </li>
          <li>
            <strong className="text-blue-600">Visual Packing Aid</strong>
            <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
              <li><em>Checklist System:</em> Mark items as <span className="font-semibold">packed</span>, <span className="font-semibold">unpacked</span>, or <span className="font-semibold">missing</span>.</li>
              <li><em>Progress Overview:</em> View your packing completion percentage and get reminders like <span className="italic">"Don’t forget your passport!"</span></li>
            </ul>
          </li>
          <li>
            <strong className="text-blue-600">Collaboration (Optional)</strong>
            <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
              <li><em>Shared Lists:</em> Sync packing lists with travel companions to divide responsibilities.</li>
            </ul>
          </li>
          <li>
            <strong className="text-blue-600">Lightweight & Offline-Friendly</strong>
            <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
              <li>Works without Wi-Fi, perfect for last-minute packing checks before flights.</li>
            </ul>
          </li>
        </ol>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Example Workflow</h2>
        <ol className="list-decimal list-inside space-y-3 text-gray-700">
          <li>Choose a template, e.g., <em>"Weekend Hiking"</em>.</li>
          <li>Customize your list by adding or removing items.</li>
          <li>Assign items to bags, like <em>"Tent → Backpack"</em>.</li>
          <li>Check off packed items; the app highlights what remains.</li>
        </ol>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Why It’s Useful</h2>
        <ul className="list-disc list-inside text-gray-700 space-y-2">
          <li>Eliminates the stress of wondering, <em>"Did I pack my charger?"</em></li>
          <li>Adaptable for solo travelers, families, or groups.</li>
        </ul>
      </section>

      <div className="mt-10">
        <Button asChild>
          <Link to="/trips" className="text-white">
            Start Packing Now
          </Link>
        </Button>
      </div>
    </main>
  );
}
