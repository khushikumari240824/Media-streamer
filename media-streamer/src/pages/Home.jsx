import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

export default function Home() {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const query = 'trending'
  const apiKey = import.meta.env.VITE_RAPID_API_KEY

  useEffect(() => {
    async function fetchVideos() {
      setLoading(true)
      setError('')

      if (!apiKey) {
        // Fallback content when API key is missing.
        setVideos([
          {
            id: 'demo-1',
            title: 'Set VITE_RAPID_API_KEY to load real videos',
            thumbnail: 'https://via.placeholder.com/320x180?text=Video',
            channelTitle: 'Media Streamer',
          },
        ])
        setLoading(false)
        return
      }

      try {
        const response = await fetch(
  `https://youtube.googleapis.com/youtube/v3/videos?part=snippet&chart=mostPopular&regionCode=IN&maxResults=25&key=${apiKey}`
)

        const data = await response.json()
        const formattedVideos = (data.items || []).map((video) => ({
 
    id: video.id,

  title: video.snippet?.title || 'Untitled video',
  thumbnail:
    video.snippet?.thumbnails?.medium?.url ||
    video.snippet?.thumbnails?.default?.url,
  channelTitle: video.snippet?.channelTitle || 'Unknown Channel',
}))

        setVideos(formattedVideos)
      } catch (fetchError) {
        console.error('Error fetching videos:', fetchError)
        setError('Unable to load videos right now.')
      } finally {
        setLoading(false)
      }
    }

    fetchVideos()
  }, [apiKey])

  return (
    <div className="p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Trending Videos</h1>
        <p className="text-sm text-gray-500">Showing: {query}</p>
      </div>

      {loading && <div className="mt-6">Loading videos...</div>}
      {!loading && error && <div className="mt-6 text-red-600">{error}</div>}

      {!loading && !error && (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {videos.map((video) => {
            const card = (
              <article className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="h-44 w-full object-cover"
                  loading="lazy"
                />
                <div className="p-3">
                  <h2 className="line-clamp-2 text-sm font-semibold">
                    {video.title}
                  </h2>
                  <p className="mt-1 text-xs text-gray-500">
                    {video.channelTitle}
                  </p>
                </div>
              </article>
            )

            return video.id ? (
              <Link key={video.id} to={`/watch/${video.id}`} className="block">
                {card}
              </Link>
            ) : (
              <div key={video.title}>{card}</div>
            )
          })}
        </div>
      )}
    </div>
  )
}