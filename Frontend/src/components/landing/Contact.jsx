import React from "react";

const Contact = () => {
  const handleSubmit = (event) => {
    event.preventDefault();
    // TODO: handle contact form submission (e.g., send data to an API)
  };

  return (
    <section id="contact" className="px-8 md:px-24 py-20 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <h2 className="text-3xl font-bold mb-6">Contact Us</h2>
      <form className="space-y-6 max-w-xl" onSubmit={handleSubmit}>
        <div className="flex flex-col">
          <label
            htmlFor="contact-name"
            className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Your Name
          </label>
          <input
            id="contact-name"
            name="name"
            type="text"
            placeholder="Your Name"
            className="w-full px-4 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
          />
        </div>
        <div className="flex flex-col">
          <label
            htmlFor="contact-email"
            className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Email
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            placeholder="Email"
            className="w-full px-4 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
          />
        </div>
        <div className="flex flex-col">
          <label
            htmlFor="contact-message"
            className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Message
          </label>
          <textarea
            id="contact-message"
            name="message"
            placeholder="Message"
            className="w-full px-4 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
          />
        </div>
        <button
          type="submit"
          className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Send Message
        </button>
      </form>
    </section>
  );
};

export default Contact;
