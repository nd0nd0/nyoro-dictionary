import { Link, useLocation, useParams } from "react-router";

export function Header() {
  const location = useLocation();
  const params = useParams();

  // Determine current locale from URL or default to 'en'
  const currentLocale = params.locale || "en";
  const isEnglish = currentLocale === "en";

  // Toggle locale
  const targetLocale = isEnglish ? "ry" : "en";

  // Construct the new URL with swapped locale
  const getLocalizedPath = () => {
    const { pathname, search } = location;

    // If we have a locale in the path, replace it
    if (pathname.startsWith(`/${currentLocale}/`)) {
      return `/${targetLocale}${pathname.slice(3)}${search}`;
    }

    // If no locale prefix, add the target locale
    return `/${targetLocale}${pathname}${search}`;
  };

  return (
    <header className="h-16 border-b border-gray-200 bg-white sticky top-0 z-20">
      <div className="h-full px-4 flex items-center justify-between">
        {/* Left: Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-stone-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-lg">RD</span>
          </div>
          <div className="hidden md:block">
            <h1 className="text-lg font-semibold text-gray-900">
              Runyoro-Rutooro Dictionary
            </h1>
          </div>
        </div>

        {/* Right: Language Switcher */}
        <Link
          to={getLocalizedPath()}
          className="bg-stone-700 text-white text-sm px-4 py-2 rounded-md hover:bg-stone-800 transition-colors"
        >
          Switch to {isEnglish ? "Runyoro" : "English"}
        </Link>
      </div>
    </header>
  );
}
