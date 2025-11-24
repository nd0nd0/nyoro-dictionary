import { data, useNavigate } from "react-router";
import type { Route } from "./+types/_layout.word.$slug";
import { getDB, getWordBySlug } from "~/db.server";
import { LuArrowLeft } from "react-icons/lu";
import { AudioPlayer } from "~/components/AudioPlayer";
import { getAudioUrl } from "~/utils/audio";

export async function loader({ params, context }: Route.LoaderArgs) {
  const { slug } = params;
  const db = getDB(context.cloudflare.env.DB);
  const word = await getWordBySlug(db, slug);

  if (!word) {
    throw data({ message: "Word not found" }, { status: 404 });
  }

  // Convert the database audio path to an API URL
  const audioUrl = getAudioUrl(word.audioPath);

  return { word: { ...word, audioUrl } };
}

export function meta({ data }: Route.MetaArgs) {
  if (!data?.word) {
    return [{ title: "Word Not Found - Runyoro Dictionary" }];
  }

  return [
    { title: `${data.word.englishTerm} - Runyoro Dictionary` },
    {
      name: "description",
      content: `Definition of ${data.word.englishTerm} in Runyoro/Rutooro and Swahili`,
    },
    {
      property: "og:title",
      content: `${data.word.englishTerm} - Runyoro Dictionary`,
    },
    { property: "og:description", content: data.word.runyoroTerm },
  ];
}

export default function WordDetail({ loaderData }: Route.ComponentProps) {
  const { word } = loaderData;
  const navigate = useNavigate();

  return (
    <div className="w-full md:max-w-4xl md:mx-auto">
      {/* Back button - mobile only */}
      <div className="md:hidden sticky top-0 bg-white border-b p-4 z-10">
        <button
          onClick={() => navigate(-1)}
          className="flex cursor-pointer items-center gap-2 text-gray-700 hover:text-gray-900"
        >
          <LuArrowLeft className="w-5 h-5" />
          <span>Back to Search</span>
        </button>
      </div>

      {/* Word Definition Content */}
      <div className="p-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <p className="text-sm text-gray-500 mb-1">English</p>
            <h1 className="text-4xl font-bold text-black">
              {word.englishTerm}
            </h1>
          </div>

          {/* Audio Player */}
          <AudioPlayer audioUrl={word.audioUrl} />
        </div>

        {/* Translations Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Runyoro/Rutooro */}
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Runyoro/Rutooro
            </h2>
            <p className="text-2xl font-medium text-gray-900">
              {word.runyoroTerm}
            </p>
          </div>

          {/* Swahili */}
          {word.swahiliTerm && (
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-2">
                Swahili
              </h2>
              <p className="text-2xl font-medium text-gray-900">
                {word.swahiliTerm}
              </p>
            </div>
          )}
        </div>

        {/* Examples */}
        {word.examples && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              Examples
            </h3>
            <div className="space-y-4">
              {word.examples.split("\n").map((example, i) => (
                <div
                  key={i}
                  className="bg-gray-50 border-l-4 border-gray-300 p-4 rounded"
                >
                  <p className="text-gray-800">{example}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Image Placeholder */}
        <div className="mt-8">
          <div className="w-full md:w-64 h-48 bg-gray-200 rounded-lg flex items-center justify-center">
            <p className="text-gray-500 text-sm">Image placeholder</p>
          </div>
        </div>
      </div>
    </div>
  );
}
