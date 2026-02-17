import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
export default function Watch() {
  const { id } = useParams()
  const [videoDetails, setVideoDetails] = useState(null)
  useEffect(() => {
    async function fetchVideoDetails() {
      if (!id) {
        return
      }
      try {
        const response = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${id}&key=${import.meta.env.VITE_RAPID_API_KEY}`
        )
        const data = await response.json()
        console.log('Video details:', data)
        setVideoDetails(data.items[0])
      } catch (error) {
        console.error('Error fetching video details:', error)
      }
    }

    fetchVideoDetails()
  }, [id])

  if (!videoDetails) {
    return <div>Loading video details...</div>
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">{videoDetails.snippet.title}</h1>
      <div className="mb-4 aspect-video w-full overflow-hidden rounded-xl bg-black/10">
        <iframe
          src={`https://www.youtube.com/embed/${id}`}
          title={videoDetails.snippet.title}
          allowFullScreen
          className="h-full w-full"
        ></iframe>
      </div>
      <p className="text-gray-700 mb-2">Channel: {videoDetails.snippet.channelTitle}</p>
      <p className="text-gray-700 mb-2">Views: {videoDetails.statistics.viewCount}</p>
      <p className="text-gray-700 mb-2">Likes: {videoDetails.statistics.likeCount}</p>
      <p className="text-gray-700 mb-2">Description: {videoDetails.snippet.description}</p>
    </div>
  )
}