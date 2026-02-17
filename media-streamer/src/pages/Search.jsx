import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
export default function Search() {
    const [searchParams] = useSearchParams()
    const query = useMemo(() => searchParams.get('q')?.trim() || '', [searchParams])
    const [videos, setVideos] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const apiKey = import.meta.env.VITE_RAPID_API_KEY

    useEffect(() => {
        async function fetchSearchResults() {
            if (!query) {
                setVideos([])
                setLoading(false)
                return
            }

            if (!apiKey) {
                setVideos([
                    {
                        id: 'demo-search-1',
                        title: 'Set VITE_RAPID_API_KEY to load real results',
                        thumbnail: 'https://via.placeholder.com/320x180?text=Search',
                        channelTitle: 'Media Streamer',
                    },
                ])
                setLoading(false)
                return
            }

            try {
                setLoading(true)
                setError('')
                const response = await fetch(
                    `https://youtube.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
                        query,
                    )}&type=video&maxResults=25&key=${apiKey}`,
                )
                const data = await response.json()
                const formattedVideos = (data.items || []).map((video) => ({
                    id: video.id?.videoId,
                    title: video.snippet?.title || 'Untitled video',
                    thumbnail:
                        video.snippet?.thumbnails?.medium?.url ||
                        video.snippet?.thumbnails?.default?.url,
                    channelTitle: video.snippet?.channelTitle || 'Unknown Channel',
                }))
                setVideos(formattedVideos)
            } catch (fetchError) {
                console.error('Error fetching search results:', fetchError)
                setError('Unable to load search results right now.')
            } finally {
                setLoading(false)
            }
        }

        fetchSearchResults()
    }, [apiKey, query])

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">
                {query ? `Search Results for "${query}"` : 'Search'}
            </h1>
            {loading && <p>Loading search results...</p>}
            {error && <p className="text-red-500">{error}</p>}
            {!loading && !error && query && videos.length === 0 && (
                <p>No results found.</p>
            )}

            {!loading && !error && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {videos.map((video) => {
                        const card = (
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
                                    <p className="text-gray-600 text-sm">{video.channelTitle}</p>
                                </div>
                            </div>
                        )

                        return video.id ? (
                            <Link key={video.id} to={`/watch/${video.id}`}>
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