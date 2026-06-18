import { Link } from "react-router-dom";

interface HeaderProps {
  hamburgerVisible?: boolean;
  onHamburgerClick?: () => void;
  showLogo?: boolean;
  title?: string;
  subtitle?: string;
}

export default function Header({
  hamburgerVisible = true,
  onHamburgerClick,
  showLogo = true,
  title = "الكشافة الحسنية",
  subtitle = "بوابة الأعضاء",
}: HeaderProps) {
  return (
    <header className="shm-gradient sticky top-0 z-50 shadow-lg" dir="rtl">
      <div className="container-shm py-4 flex items-center justify-between">
        {/* Logo Section */}
        {showLogo ? (
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity duration-200">
            <img
              src="https://cdn.builder.io/api/v1/image/assets%2F1f75f54747b54e29825eb23fdf70cfc1%2Fa8caeb8f3ae14cfe9ddb9534cad38297?format=webp&width=800&height=1200"
              alt="شعار الكشافة الحسنية"
              className="w-12 h-12 flex-shrink-0"
            />
            <div className="text-right">
              <h1 className="text-lg md:text-xl font-bold text-white">{title}</h1>
              <p className="text-xs md:text-sm text-white/80">{subtitle}</p>
            </div>
          </Link>
        ) : (
          <div className="text-white text-2xl font-bold">SHM</div>
        )}

        {/* Navigation and Actions */}
        <nav className="flex gap-4 md:gap-8 items-center">
          <Link
            to="/"
            className="text-white hover:text-gray-200 font-medium text-sm md:text-base transition-colors duration-200"
          >
            الرئيسية
          </Link>
          <a
            href="#logout"
            className="text-white hover:text-gray-200 font-medium text-sm md:text-base transition-colors duration-200"
          >
            تسجيل الخروج
          </a>

          {/* Hamburger Menu Button */}
          {hamburgerVisible && (
            <button
              onClick={onHamburgerClick}
              className="md:hidden flex flex-col gap-1.5 text-white hover:bg-white/10 transition-all p-2 rounded-lg"
              aria-label="فتح القائمة"
              aria-expanded="false"
            >
              <span className="w-6 h-0.5 bg-white rounded"></span>
              <span className="w-6 h-0.5 bg-white rounded"></span>
              <span className="w-6 h-0.5 bg-white rounded"></span>
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
