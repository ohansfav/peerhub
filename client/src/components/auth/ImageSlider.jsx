import { useState, useEffect } from "react";
import slide1 from "../../assets/images/auth/slide-1.svg";
import slide2 from "../../assets/images/auth/slide-2.svg";
import slide3 from "../../assets/images/auth/slide-3.svg";
import slide4 from "../../assets/images/auth/slide-4.svg";
import slide5 from "../../assets/images/auth/slide-5.svg";
import newSlide1 from "../../assets/images/auth/new-slide-1.png";
import newSlide2 from "../../assets/images/auth/new-slide-2.png";
import newSlide3 from "../../assets/images/auth/new-slide-3.png";
import newSlide4 from "../../assets/images/auth/new-slide-4.png";

export default function ImageSlider() {
  // const images = [slide1, slide2, slide3, slide4, slide5];
  // const images = [newSlide1, newSlide2, newSlide3, newSlide4];
  const slideData = [
    // {
    //   image: newSlide1,
    //   title: "Ace your exams confidently",
    //   subtitle:
    //     "Step into the hall fully prepared, walk out victorious and come out on top",
    // },
    {
      image: newSlide2,
      title: "Your Pathway to Success",
      subtitle:
        "The support you need to turn your preparations into successful grades",
    },
    {
      image: newSlide4,
      title: "Guide students to success",
      subtitle:
        "Share your expertise and guide students towards academic excellence",
    },
    {
      image: newSlide3,
      title: "Get help from Experts",
      subtitle:
        "Find trusted tutor that are ready to guide you through difficult topic",
    },
  ];
  const [current, setCurrent] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setFade(false); // start fade-out
      setTimeout(() => {
        setCurrent((prev) => (prev + 1) % slideData.length);
        setFade(true); // fade-in next image
      }, 500); // matches fade-out duration
    }, 5000);
    return () => clearInterval(timer);
  }, [slideData.length]);

  // useEffect(() => {
  //   const timer = setInterval(() => {
  //     setCurrent((prev) => (prev + 1) % images.length);
  //   }, 4000); // change every 4s
  //   return () => clearInterval(timer);
  // }, [images.length]);

  const currentSlide = slideData[current];

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* <img
        src={images[current]}
        alt={`Slide ${current + 1}`}
        className={`w-full h-full object-cover transition-opacity duration-500 ease-in-out ${
          fade ? "opacity-100" : "opacity-0"
        }`}/> */}
      {/* Background Image */}
      <div
        className={`w-full h-full bg-center bg-cover transition-opacity duration-500 ease-in-out ${
          fade ? "opacity-100" : "opacity-0"
        }`}
        style={{
          backgroundImage: `url(${currentSlide.image})`,
        }}
      />
      {/* Background Image with Custom Sizing */}
      {/* <div
        className={`w-full h-full bg-center bg-no-repeat transition-opacity duration-500 ease-in-out ${
          fade ? "opacity-100" : "opacity-0"
        }`}
        style={{
          backgroundImage: `url(${currentSlide.image})`,
          // backgroundSize: "90%", // Reduce from 100% (cover) to 90%
          // Other options:
          // backgroundSize: '80%',           // Even smaller
          backgroundSize: "95% 99%", // Full width, 80% height
          // backgroundSize: '80% 100%',      // 80% width, full height
          // backgroundSize: 'contain',       // Fit entire image (may show background)
          // backgroundSize: '800px 600px',   // Fixed pixel size
          // backgroundSize: 'auto',          // Original image size
          backgroundColor: "#f8f9fa", // Light background for empty areas
        }}
      /> */}

      {/* Overlay Gradient for Better Text Readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

      {/* Text Content Overlay */}
      <div className="absolute inset-0 flex items-end justify-center p-8 mb-4">
        <div
          className={`text-center max-w-md transition-all duration-500 ease-in-out transform ${
            fade ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <h1 className="text-2xl font-bold text-white mb-4 leading-tight">
            {currentSlide.title}
          </h1>
          <p className="text-lg text-white/90 leading-relaxed">
            {currentSlide.subtitle}
          </p>
        </div>
      </div>

      {/* Optional: Navigation Dots */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3">
        {slideData.map((_, index) => (
          <button
            key={index}
            className={`h-2 w-2 rounded-full transition-all duration-300 ${
              current === index
                ? "bg-[#0568FF] scale-125"
                : "bg-white/50 hover:bg-white/70"
            }`}
            onClick={() => setCurrent(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
