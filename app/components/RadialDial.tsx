import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export function RadialDial() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const letter = searchParams.get("letter");
  const [activeLetter, setActiveLetter] = useState<string | null>(letter);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync active letter with query param
  useEffect(() => {
    setActiveLetter(letter);
  }, [letter]);

  const handleLetterClick = (selectedLetter: string) => {
    // Create new search params
    const newParams = new URLSearchParams(searchParams);

    // Clear search query when browsing by letter
    newParams.delete("q");

    // If clicking the same letter, remove the filter
    if (letter === selectedLetter) {
      newParams.delete("letter");
    } else {
      newParams.set("letter", selectedLetter);
    }

    // Navigate with new params, preserving the current pathname
    navigate(`${location.pathname}?${newParams.toString()}`, { replace: true });
  };

  return (
    <>
      {/* Desktop: Vertical Dial */}
      <div className="hidden md:block">
        <div
          ref={containerRef}
          className={`h-[600px] overflow-y-auto snap-y snap-mandatory py-8 ${
            // Don't apply mask to top if early letters (A-E) are selected
            activeLetter && ["A", "B", "C", "D", "E"].includes(activeLetter)
              ? ""
              : "radial-dial-mask"
          }`}
        >
          <div className="flex flex-col items-center space-y-2">
            {LETTERS.map((l) => (
              <motion.button
                key={l}
                onClick={() => handleLetterClick(l)}
                animate={{
                  scale: activeLetter === l ? 1.25 : 0.9,
                  fontWeight: activeLetter === l ? 700 : 400,
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                }}
                className={`
                  snap-center
                  w-10 h-10
                  flex items-center justify-center
                  rounded-full
                  transition-colors
                  ${
                    activeLetter === l
                      ? "text-black bg-white shadow-md"
                      : "text-gray-400 hover:text-gray-600"
                  }
                `}
              >
                {l}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile: Horizontal Dial */}
      <div className="md:hidden sticky top-0 z-10  bg-stone-50 border-b border-gray-200">
        <div
          className={`overflow-x-auto snap-x snap-mandatory px-4 py-3 ${
            // Don't apply mask to left if early letters (A-E) are selected
            activeLetter && ["A", "B", "C", "D", "E"].includes(activeLetter)
              ? ""
              : "horizontal-dial-mask"
          }`}
        >
          <div className="flex space-x-2 min-w-max">
            {LETTERS.map((l) => (
              <motion.button
                key={l}
                onClick={() => handleLetterClick(l)}
                animate={{
                  scale: activeLetter === l ? 1.15 : 1,
                  fontWeight: activeLetter === l ? 700 : 400,
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                }}
                className={`
                  snap-center
                  px-4 py-2
                  cursor-pointer

                  min-w-12
                  rounded-lg
                  transition-colors
                  ${
                    activeLetter === l
                      ? "text-black bg-white shadow-sm"
                      : "text-gray-400 hover:text-gray-600"
                  }
                `}
              >
                {l}
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
