import { useState } from "react";
import { Link } from "react-router-dom";
import { GraduationCap, Facebook, Twitter, Mail } from "lucide-react";
import { ASSETS } from "../../config/assets";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email && email.includes("@")) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  const footerLinks = {
    product: [
      { label: "Main App", to: "#" },
      { label: "Mobile Web App", to: "#" },
    ],
    support: [
      {
        label: "FAQ",
        onClick: () =>
          document
            .getElementById("faq")
            ?.scrollIntoView({ behavior: "smooth" }),
      },
      {
        label: "Contact Us",
        onClick: () =>
          document
            .getElementById("contact")
            ?.scrollIntoView({ behavior: "smooth" }),
      },
    ],
    connect: [
      { label: "Twitter", icon: Twitter, href: "#" },
      { label: "Facebook", icon: Facebook, href: "#" },
    ],
    about: [
      {
        label: "About",
        onClick: () =>
          document
            .getElementById("about")
            ?.scrollIntoView({ behavior: "smooth" }),
      },
    ],
  };

  return (
    <footer id="contact" className="bg-gradient-to-b from-slate-900 to-slate-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="flex flex-col items-start sm:items-center">
                <img
                  src={ASSETS.logo?.image}
                  alt={ASSETS.logo?.alt}
                  className="h-8 md:h-8"
                />
                <p className="text-xl md:text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                  Peerup
                </p>
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-6">
              Peer-to-peer learning for university students. Learn better, together.
            </p>

            <div>
              <h3 className="font-semibold mb-3">
                Subscribe for updates and free resources.
              </h3>
              <form
                onSubmit={handleSubscribe}
                className="flex flex-col sm:flex-row gap-2"
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address"
                  className="flex-1 px-4 py-2 rounded-full bg-white text-[#1C252E] border border-gray-700 focus:outline-none focus:border-blue-500 transition-colors"
                  required
                />
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-full font-semibold transition-colors text-white"
                >
                  Subscribe
                </button>
              </form>
              {subscribed && (
                <p className="text-blue-400 text-sm mt-2">
                  Thanks for subscribing!
                </p>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-gray-200 hover:text-blue-400 transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={link.onClick}
                    className="text-gray-200 hover:text-blue-400 transition-colors text-sm text-left"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Connect</h3>
            <ul className="space-y-2">
              {footerLinks.connect.map((link) => {
                const Icon = link.icon;
                return (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-gray-200 hover:text-blue-400 transition-colors text-sm flex items-center space-x-2"
                    >
                      <Icon className="w-4 h-4" />
                      <span>{link.label}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
            <div className="mt-4">
              <h3 className="font-semibold mb-4">About Us</h3>
              <ul className="space-y-2">
                {footerLinks.about.map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={link.onClick}
                      className="text-gray-200 hover:text-blue-400 transition-colors text-sm text-left"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-700 text-center text-gray-300 text-sm">
          <p>
            &copy; {new Date().getFullYear()} Peerup. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
