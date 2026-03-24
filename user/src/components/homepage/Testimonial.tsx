"use client";

const testimonials = [
  {
    id: 1,
    name: "Sarah Mitchell",
    review:
      "Absolutely love the quality! The products exceeded my expectations and the customer service was outstanding.",
    rating: 5,
  },
  {
    id: 2,
    name: "James Anderson",
    review:
      "Fast shipping and beautiful packaging. Will definitely be ordering again. Highly recommend to everyone!",
    rating: 5,
  },
  {
    id: 3,
    name: "Emily Chen",
    review:
      "Great value for money. The attention to detail is impressive and the products are exactly as described.",
    rating: 4,
  },
  {
    id: 4,
    name: "Michael Roberts",
    review:
      "Been a loyal customer for years. Consistent quality and always a pleasure to shop here.",
    rating: 5,
  },
  {
    id: 5,
    name: "Lisa Thompson",
    review:
      "The best shopping experience I've had online. Everything arrived perfectly and on time.",
    rating: 5,
  },
  {
    id: 6,
    name: "David Wilson",
    review:
      "Impressed with the craftsmanship. You can tell they really care about their products.",
    rating: 4,
  },
];


function QuoteIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="28"
      height="28"
      viewBox="0 0 64 64"
      className="mb-2"
    >
      <circle cx="32" cy="32" r="30" fill="#f2f2f2" />
      <path
        fill="#555"
        d="M26.4 22c-3.7 2.1-6.2 6.4-6.2 10.6 0 4.7 3 7.4 6.7 7.4 3.3 0 6.1-2.6 6.1-6.1 0-3.5-2.6-6-6.1-6.1.5-2.4 2.3-4.4 4.7-5.6l-1.2-2.7zm15.4 0c-3.7 2.1-6.2 6.4-6.2 10.6 0 4.7 3 7.4 6.7 7.4 3.3 0 6.1-2.6 6.1-6.1 0-3.5-2.6-6-6.1-6.1.5-2.4 2.3-4.4 4.7-5.6l-1.2-2.7z"
      />
    </svg>
  );
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      className={`w-3 h-3 ${filled ? "text-gold" : "text-border-light"}`}
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={filled ? 0 : 1.5}
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
      />
    </svg>
  );
}

function TestimonialCard({
  name,
  review,
  rating,
}: {
  name: string;
  review: string;
  rating: number;
}) {
  return (
    <div className="bg-ivory rounded-card p-4 shadow-card hover:shadow-card-hover transition-all duration-normal hover:-translate-y-1 h-full">
      <QuoteIcon />
      <div className="flex gap-0.5 mb-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon key={star} filled={star <= rating} />
        ))}
      </div>
      <p className="text-small text-text-secondary leading-snug mb-3 italic line-clamp-3">
        &ldquo;{review}&rdquo;
      </p>
      <p className="text-caption font-semibold text-text-primary tracking-wide">
        {name}
      </p>
    </div>
  );
}


function MarqueeCard({
  name,
  review,
  rating,
}: {
  name: string;
  review: string;
  rating: number;
}) {
  return (
    <div className="flex-shrink-0 w-[220px] bg-ivory rounded-card p-3 shadow-card mx-2">
      <div className="flex gap-0.5 mb-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon key={star} filled={star <= rating} />
        ))}
      </div>
      <p className="text-caption text-text-secondary leading-snug mb-2 italic line-clamp-2">
        &ldquo;{review}&rdquo;
      </p>
      <p className="text-[11px] font-semibold text-text-primary tracking-wide">
        {name}
      </p>
    </div>
  );
}

function MobileMarquee() {
  // Split testimonials into two rows
  const row1 = testimonials.slice(0, 3);
  const row2 = testimonials.slice(3);

  return (
    <div className="sm:hidden overflow-hidden">
      {/* Row 1 - Scrolls Left */}
      <div className="relative mb-4">
        <div className="flex animate-slide-left">
          {/* Original set */}
          {row1.map((testimonial) => (
            <MarqueeCard
              key={testimonial.id}
              name={testimonial.name}
              review={testimonial.review}
              rating={testimonial.rating}
            />
          ))}
          {/* Duplicate set for seamless loop */}
          {row1.map((testimonial) => (
            <MarqueeCard
              key={`dup-${testimonial.id}`}
              name={testimonial.name}
              review={testimonial.review}
              rating={testimonial.rating}
            />
          ))}
        </div>
      </div>

      {/* Row 2 - Scrolls Right */}
      <div className="relative">
        <div className="flex animate-slide-right">
          {/* Original set */}
          {row2.map((testimonial) => (
            <MarqueeCard
              key={testimonial.id}
              name={testimonial.name}
              review={testimonial.review}
              rating={testimonial.rating}
            />
          ))}
          {/* Duplicate set for seamless loop */}
          {row2.map((testimonial) => (
            <MarqueeCard
              key={`dup-${testimonial.id}`}
              name={testimonial.name}
              review={testimonial.review}
              rating={testimonial.rating}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Testimonial() {
  return (
    <section className="bg-creme py-section-mobile md:py-section overflow-hidden">
      <div className="max-w-content mx-auto">
        {/* Section Header */}
        <div className="px-container mb-10 md:mb-16">
          <div className="animate-slide-up">
            {/* Accent line */}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-0.5 bg-tango rounded-full" />
              <span className="text-caption text-tango uppercase tracking-wider font-medium">
                Customer Love
              </span>
            </div>
            <h2 className="text-h2 md:text-h1 text-text-primary font-secondary tracking-tight">
              What Our Customers Say
            </h2>
            <p className="text-small text-text-secondary mt-2 leading-relaxed max-w-md">
              Real reviews from our valued customers
            </p>
          </div>
        </div>

        {/* Mobile Infinite Marquee */}
        <MobileMarquee />

        {/* Desktop/Tablet Grid */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-4 px-container">
          {testimonials.map((testimonial) => (
            <TestimonialCard
              key={testimonial.id}
              name={testimonial.name}
              review={testimonial.review}
              rating={testimonial.rating}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
