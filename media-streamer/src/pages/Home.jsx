// import { useEffect, useState } from 'react'
// import { Link } from 'react-router-dom'

// export default function Home() {
//   const [videos, setVideos] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState('')
//   const query = 'trending'
//   const apiKey = import.meta.env.VITE_RAPID_API_KEY

//   useEffect(() => {
//     async function fetchVideos() {
//       setLoading(true)
//       setError('')

//       if (!apiKey) {
//         // Fallback content when API key is missing.
//         setVideos([
//           {
//             id: 'demo-1',
//             title: 'Set VITE_RAPID_API_KEY to load real videos',
//             thumbnail: 'https://via.placeholder.com/320x180?text=Video',
//             channelTitle: 'Media Streamer',
//           },
//         ])
//         setLoading(false)
//         return
//       }

//       try {
//         const response = await fetch(
//   `https://youtube.googleapis.com/youtube/v3/videos?part=snippet&chart=mostPopular&regionCode=IN&maxResults=25&key=${apiKey}`
// )

//         const data = await response.json()
//         const formattedVideos = (data.items || []).map((video) => ({
 
//     id: video.id,

//   title: video.snippet?.title || 'Untitled video',
//   thumbnail:
//     video.snippet?.thumbnails?.medium?.url ||
//     video.snippet?.thumbnails?.default?.url,
//   channelTitle: video.snippet?.channelTitle || 'Unknown Channel',
// }))

//         setVideos(formattedVideos)
//       } catch (fetchError) {
//         console.error('Error fetching videos:', fetchError)
//         setError('Unable to load videos right now.')
//       } finally {
//         setLoading(false)
//       }
//     }

//     fetchVideos()
//   }, [apiKey])

//   return (
//     <div className="p-6">
//       <div className="flex flex-col gap-2">
//         <h1 className="text-2xl font-semibold">Trending Videos</h1>
//         <p className="text-sm text-gray-500">Showing: {query}</p>
//       </div>

//       {loading && <div className="mt-6">Loading videos...</div>}
//       {!loading && error && <div className="mt-6 text-red-600">{error}</div>}

//       {!loading && !error && (
//         <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
//           {videos.map((video) => {
//             const card = (
//               <article className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
//                 <img
//                   src={video.thumbnail}
//                   alt={video.title}
//                   className="h-44 w-full object-cover"
//                   loading="lazy"
//                 />
//                 <div className="p-3">
//                   <h2 className="line-clamp-2 text-sm font-semibold">
//                     {video.title}
//                   </h2>
//                   <p className="mt-1 text-xs text-gray-500">
//                     {video.channelTitle}
//                   </p>
//                 </div>
//               </article>
//             )

//             return video.id ? (
//               <Link key={video.id} to={`/watch/${video.id}`} className="block">
//                 {card}
//               </Link>
//             ) : (
//               <div key={video.title}>{card}</div>
//             )
//           })}
//         </div>
//       )}
//     </div>
//   )
// }
import React, { useState, useEffect } from "react";
import VideoCard from "../components/VideoCard";
import ShimmerCard from "../components/ShimmerCard";

export default function Home() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState("All");

  // pagination tokens from YouTube API
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
    // ensure view resets when page or category updates
    window.scrollTo(0, 0);

    async function fetchVideos() {
      setLoading(true);
      setError(null);

      try {
        // ✅ CORRECT ENV VARIABLE
        const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

        const searchQuery =
          activeCategory === "All" ? "trending" : activeCategory;

        // include pageToken if we have one
        const tokenParam = pageToken ? `&pageToken=${pageToken}` : "";

        const response = await fetch(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=24&q=${searchQuery}&type=video&key=${API_KEY}${tokenParam}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch videos");
        }

        const data = await response.json();
        setVideos(data.items || []);
        // update tokens for pagination
        setNextPageToken(data.nextPageToken || null);
        setPrevPageToken(data.prevPageToken || null);
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
      {/* Category Filters */}
      <div className="mb-6 flex gap-3 overflow-x-auto pb-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => {
              setActiveCategory(category);
              // reset pagination when switching categories
              setPageToken("");
              setPageNumber(1);
            }}
            className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
              activeCategory === category
                ? "bg-gray-900 dark:bg-white text-white dark:text-black"
                : "bg-gray-200 dark:bg-gray-800 text-black dark:text-white hover:bg-gray-300 dark:hover:bg-gray-700"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
          {Array.from({ length: 24 }).map((_, index) => (
            <ShimmerCard key={index} />
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="text-center py-20">
          <p className="text-red-500 mb-2">Error loading videos</p>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      )}

      {/* Videos */}
      {!loading && !error && videos.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
          {videos.map((video) => (
            <VideoCard
              key={video.id.videoId || video.id}
              video={video}
            />
          ))}
        </div>
      )}

      {/* No Videos */}
      {!loading && !error && videos.length === 0 && (
        <div className="text-center py-20">
          <h2 className="text-2xl font-semibold mb-2">
            No videos found
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Try selecting a different category
          </p>
        </div>
      )}

      {/* Pagination Controls */}
      {!loading && !error && videos.length > 0 && (
        <div className="flex justify-center items-center gap-4 my-8">
          <button
            disabled={!prevPageToken}
            onClick={() => {
              if (prevPageToken) {
                setPageToken(prevPageToken);
                setPageNumber((n) => Math.max(1, n - 1));
              }
            }}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-800 rounded-lg disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm">
            Page {pageNumber}
          </span>
          <button
            disabled={!nextPageToken}
            onClick={() => {
              if (nextPageToken) {
                setPageToken(nextPageToken);
                setPageNumber((n) => n + 1);
              }
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
