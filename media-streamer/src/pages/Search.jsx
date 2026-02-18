import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

export default function Search() {
  const [searchParams] = useSearchParams();
  const query = useMemo(
    () => searchParams.get("q")?.trim() || "",
    [searchParams]
  );

  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;

  useEffect(() => {
    async function fetchSearchResults() {
      if (!query) {
        setVideos([]);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=24&q=${encodeURIComponent(
            query
          )}&key=${apiKey}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch search results");
        }

        const data = await response.json();

        const formattedVideos = (data.items || [])
          .filter((video) => video.id?.videoId)
          .map((video) => ({
            id: video.id.videoId,
            title: video.snippet.title,
            thumbnail:
              video.snippet.thumbnails.medium?.url ||
              video.snippet.thumbnails.default?.url,
            channelTitle: video.snippet.channelTitle,
          }));

        setVideos(formattedVideos);
      } catch (err) {
        console.error(err);
        setError("Unable to load search results.");
      } finally {
        setLoading(false);
      }
    }

    fetchSearchResults();
  }, [query, apiKey]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        {query ? `Search Results for "${query}"` : "Search"}
      </h1>

      {loading && <p>Loading search results...</p>}

      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && query && videos.length === 0 && (
        <p>No results found.</p>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {videos.map((video) => (
            <Link key={video.id} to={`/watch/${video.id}`}>
              <div className="bg-white rounded-lg shadow-md overflow-hidden transition hover:-translate-y-1 hover:shadow-lg">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-48 object-cover"
                />

                <div className="p-4">
                  <h2 className="text-sm font-semibold mb-2 line-clamp-2">
                    {video.title}
                  </h2>

                  <p className="text-gray-600 text-sm">
                    {video.channelTitle}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
