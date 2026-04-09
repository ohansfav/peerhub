import Section from "../common/Section";
import { TESTIMONIALS } from "../../config/assets";
import StarRating from "../common/StarRatings";

const TestimonialCard = ({ testimonial }) => {
  return (
    <div className="bg-white flex flex-col justify-between rounded-xl p-6 md:p-8 shadow-md hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center mb-4">
        <StarRating rating={testimonial.rating} />
      </div>

      <p className="text-gray-700 mb-6 leading-relaxed italic">
        "{testimonial.text}"
      </p>

      <div className="flex items-center space-x-4">
        <img
          src={testimonial.image}
          alt={testimonial.alt}
          className="w-14 h-14 rounded-full object-cover border-2 border-blue-200"
        />
        <div>
          <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
          <p className="text-sm text-blue-600">{testimonial.role}</p>
        </div>
      </div>
    </div>
  );
};

const TestimonialsSection = () => {
  return (
    <Section background="blue">
      <div className="text-center mb-12 md:mb-16">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
          <span className="text-blue-600">Testimonials</span>
        </h2>
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
          Hear from students and tutors who are part of the Peerhub
          community.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {TESTIMONIALS.map((testimonial) => (
          <TestimonialCard key={testimonial.id} testimonial={testimonial} />
        ))}
      </div>
    </Section>
  );
};

export default TestimonialsSection;
