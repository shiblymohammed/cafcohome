"use client";

import { useState } from "react";

const faqs = [
  {
    question: "What are your showroom hours?",
    answer: "Our showroom is open Monday through Saturday, 10am to 7pm. We're closed on Sundays and public holidays.",
  },
  {
    question: "Do you offer design consultations?",
    answer: "Yes! We offer complimentary design consultations both in-store and virtually. Book an appointment to discuss your project with our experts.",
  },
  {
    question: "What is your delivery timeframe?",
    answer: "Standard delivery takes 2-4 weeks. Custom orders may take 6-8 weeks depending on specifications.",
  },
  {
    question: "Do you ship internationally?",
    answer: "Yes, we ship to over 25 countries worldwide. International shipping rates and times vary by location.",
  },
];

export default function ContactClient() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log("Form submitted:", formData);
    alert("Thank you for your message! We'll get back to you soon.");
    setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
  };

  return (
    <>
      {/* Contact Form & Map Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-[1440px] mx-auto px-4 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
            {/* Contact Form */}
            <div>
              <span className="text-xs font-primary uppercase tracking-[0.25em] text-alpha/60 mb-2 flex items-center gap-4">
                <span className="w-12 h-[1px] bg-alpha/30"></span>
                Send a Message
              </span>
              <h2 className="text-3xl md:text-4xl font-secondary text-alpha leading-tight mb-8">
                How Can We <span className="italic font-light">Help?</span>
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-primary uppercase tracking-wider text-alpha/60 mb-2">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-alpha/10 text-alpha text-sm font-primary focus:outline-none focus:border-alpha/40 transition-colors"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-primary uppercase tracking-wider text-alpha/60 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-alpha/10 text-alpha text-sm font-primary focus:outline-none focus:border-alpha/40 transition-colors"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-primary uppercase tracking-wider text-alpha/60 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-alpha/10 text-alpha text-sm font-primary focus:outline-none focus:border-alpha/40 transition-colors"
                      placeholder="+1 234 567 890"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-primary uppercase tracking-wider text-alpha/60 mb-2">
                      Subject *
                    </label>
                    <select
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-alpha/10 text-alpha text-sm font-primary focus:outline-none focus:border-alpha/40 transition-colors"
                    >
                      <option value="">Select a subject</option>
                      <option value="general">General Inquiry</option>
                      <option value="product">Product Question</option>
                      <option value="order">Order Status</option>
                      <option value="consultation">Design Consultation</option>
                      <option value="partnership">Business Partnership</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-primary uppercase tracking-wider text-alpha/60 mb-2">
                    Your Message *
                  </label>
                  <textarea
                    required
                    rows={6}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-alpha/10 text-alpha text-sm font-primary focus:outline-none focus:border-alpha/40 transition-colors resize-none"
                    placeholder="Tell us how we can help you..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto px-10 py-4 bg-alpha text-creme text-xs uppercase tracking-widest font-primary hover:bg-alpha/90 transition-colors"
                >
                  Send Message
                </button>
              </form>
            </div>

            {/* Map */}
            <div>
              <span className="text-xs font-primary uppercase tracking-[0.25em] text-alpha/60 mb-2 flex items-center gap-4">
                <span className="w-12 h-[1px] bg-alpha/30"></span>
                Find Us
              </span>
              <h2 className="text-3xl md:text-4xl font-secondary text-alpha leading-tight mb-8">
                Our <span className="italic font-light">Location</span>
              </h2>

              {/* Google Map Embed */}
              <div className="relative aspect-[4/3] lg:aspect-auto lg:h-[500px] overflow-hidden border border-alpha/10">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2798.1234567890123!2d9.1859243!3d45.4654219!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4786c6aec34636a1%3A0xab7f4e27101a2e13!2sMilan%2C%20Metropolitan%20City%20of%20Milan%2C%20Italy!5e0!3m2!1sen!2sus!4v1234567890123!5m2!1sen!2sus"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="absolute inset-0 grayscale hover:grayscale-0 transition-all duration-500"
                />
              </div>

              {/* Address below map */}
              <div className="mt-6 p-6 bg-white border border-alpha/10">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center border border-alpha/20 text-alpha">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-secondary text-alpha mb-1">CAFCO Showroom</h4>
                    <p className="text-xs font-primary text-alpha/60 leading-relaxed">
                      123 Design District, Milan, Italy 20121
                    </p>
                    <a
                      href="https://maps.google.com/?q=Milan,Italy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 mt-3 text-xs uppercase tracking-wider font-primary text-alpha hover:text-tango transition-colors"
                    >
                      Get Directions
                      <span>→</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-24 bg-alpha">
        <div className="max-w-[1440px] mx-auto px-4 md:px-12">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <span className="inline-flex items-center gap-3 text-xs font-primary uppercase tracking-[0.25em] text-creme/50 mb-4">
                <span className="w-8 h-[1px] bg-creme/30"></span>
                Common Questions
                <span className="w-8 h-[1px] bg-creme/30"></span>
              </span>
              <h2 className="text-3xl md:text-4xl font-secondary text-creme leading-tight">
                Frequently <span className="italic font-light">Asked</span>
              </h2>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="border border-creme/10 overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full flex items-center justify-between p-6 text-left hover:bg-creme/5 transition-colors"
                  >
                    <span className="text-base font-secondary text-creme pr-4">{faq.question}</span>
                    <span className={`text-creme/60 transition-transform duration-300 ${openFaq === index ? 'rotate-45' : ''}`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                      </svg>
                    </span>
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      openFaq === index ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <p className="px-6 pb-6 text-sm font-primary text-creme/70 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
