export default function Index() {
  return (
    <div className="hidden md:flex items-center justify-center h-full p-8">
      <div className="text-center max-w-md">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Runyoro-Rutooro Dictionary
        </h1>
        <p className="text-gray-600 mb-6">
          Select a word from the list to view its definition, or use the search
          bar to find specific words.
        </p>
        <div className="bg-stone-50 rounded-lg p-6 border border-gray-200">
          <p className="text-sm text-gray-500 italic">
            Word of the Day feature coming soon...
          </p>
        </div>
      </div>
    </div>
  );
}
