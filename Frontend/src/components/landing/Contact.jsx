import React from "react";

const Contact = () => {
  return (
    <section id="contact" className="px-8 md:px-24 py-20 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <h2 className="text-3xl font-bold mb-6">Contact Us</h2>
      <form className="space-y-6 max-w-xl">
        <input
          type="text"
          placeholder="Your Name"
          className="w-full px-4 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
        />
        <input
          type="email"
          placeholder="Email"
          className="w-full px-4 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
        />
        <textarea
          placeholder="Message"
          className="w-full px-4 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
        />
        <button className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Send Message
        </button>
      </form>
    </section>
  );
};

export default Contact;
