import React, { useState, useEffect } from "react";
import VideoCard from "../components/VideoCard";
import ShimmerCard from "../components/ShimmerCard";

export default function Home() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState("All");

  const [pageToken, setPageToken] = useState("");
  const [nextPageToken, setNextPageToken] = useState(null);
  const [prevPageToken, setPrevPageToken] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);

  const categories = [
    "All",
    "Music",
    "Gaming",
    "News",
    "Live",
    "Sports",
    "Learning",
  ];

  useEffect(() => {
    window.scrollTo(0, 0);

    async function fetchVideos() {
      setLoading(true);
      setError(null);

      try {
        const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

        const searchQuery =
          activeCategory === "All" ? "trending" : activeCategory;

        const tokenParam = pageToken ? `&pageToken=${pageToken}` : "";

        const searchResponse = await fetch(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=24&q=${searchQuery}&type=video&key=${API_KEY}${tokenParam}`
        );

        if (!searchResponse.ok) {
          throw new Error("Failed to fetch videos");
        }

        const searchData = await searchResponse.json();

        const videoIds = searchData.items
          .map((item) => item.id.videoId)
          .join(",");

        const detailsResponse = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoIds}&key=${API_KEY}`
        );

        if (!detailsResponse.ok) {
          throw new Error("Failed to fetch video details");
        }

        const detailsData = await detailsResponse.json();

        setVideos(detailsData.items || []);
        setNextPageToken(searchData.nextPageToken || null);
        setPrevPageToken(searchData.prevPageToken || null);
      } catch (err) {
        console.error("Error fetching videos:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchVideos();
  }, [activeCategory, pageToken]);

  return (
    <div className="text-black dark:text-white">
      <div className="mb-6 flex gap-3 overflow-x-auto pb-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => {
              setActiveCategory(category);
              setPageToken("");
              setPageNumber(1);
            }}
            className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
              activeCategory === category
                ? "bg-gray-900 dark:bg-white text-white dark:text-black"
                : "bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
          {Array.from({ length: 24 }).map((_, index) => (
            <ShimmerCard key={index} />
          ))}
        </div>
      )}

      {error && (
        <div className="text-center py-20">
          <p className="text-red-500 mb-2">Error loading videos</p>
          <p className="text-gray-500 text-sm">{error}</p>
        </div>
      )}

      {!loading && !error && videos.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
          {videos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      )}

      {!loading && !error && videos.length === 0 && (
        <div className="text-center py-20">
          <h2 className="text-2xl font-semibold mb-2">
            No videos found
          </h2>
        </div>
      )}

      {!loading && !error && videos.length > 0 && (
        <div className="flex justify-center items-center gap-4 my-8">
          <button
            disabled={!prevPageToken}
            onClick={() => {
              setPageToken(prevPageToken);
              setPageNumber((n) => Math.max(1, n - 1));
            }}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-800 rounded-lg disabled:opacity-50"
          >
            Previous
          </button>

          <span className="text-sm">Page {pageNumber}</span>

          <button
            disabled={!nextPageToken}
            onClick={() => {
              setPageToken(nextPageToken);
              setPageNumber((n) => n + 1);
            }}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-800 rounded-lg disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
