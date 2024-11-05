import Link from "next/link";
import { FaMusic } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-white/20 backdrop-blur-md py-6 mt-auto">
      <div className="container mx-auto px-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="text-soft-brown">Made with</span>
          <FaMusic className="text-terracotta animate-bounce" />
          <span className="text-soft-brown">by Mood Mix</span>
        </div>
        <nav className="flex justify-center gap-4">
          <Link
            href="/about"
            className="text-soft-brown hover:text-terracotta transition-colors duration-300"
          >
            About
          </Link>
          <Link
            href="/contact"
            className="text-soft-brown hover:text-terracotta transition-colors duration-300"
          >
            Contact
          </Link>
        </nav>
        <p className="text-sm text-soft-brown mt-4">© 2024 Mood Mix</p>
      </div>
    </footer>
  );
};

export default Footer;
