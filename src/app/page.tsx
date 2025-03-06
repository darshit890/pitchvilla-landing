import { FullScreenVideo } from "@/components/auto-play-video"

export default function Home() {
  return (
    <main>
      <FullScreenVideo
        src="Black Minimalist Animated Coming Soon Video (2).mp4"
        mobileSrc="Black White Grunge Coming Soon Mobile Video.mp4"
        showControls={false}
        overlay={false}
      />
    </main>
  )
}

