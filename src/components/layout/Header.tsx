import { FaMusic } from "react-icons/fa";

const Header = () => {
  return (
    <header className="bg-white/10 backdrop-blur-sm py-4 sticky top-0 z-10 transition-all duration-300">
      <div className="container mx-auto px-4 flex items-center justify-center">
        <div className="flex items-center gap-2 group hover:scale-105 transition-transform duration-300">
          <FaMusic className="text-terracotta text-xl group-hover:rotate-12 transition-transform duration-300" />
          <h1 className="text-2xl heading-accent text-text/90">Mood Mix</h1>
        </div>
      </div>
    </header>
  );
};

export default Header;
