import ChatWindow from "@/components/ChatWindow";
import { PlayerBlock } from "@/utils/player";

export default async function Home() {

  let heroData: any;

  try {
    const playerJson = await fetch("http://localhost:3000/api/player", { method: "GET" })
    const data = await playerJson.json()
    heroData = data[0]
  } catch {
    heroData = null
  }

  return (
    <main className="pt-[10dvh] bg-purple-50">
      <ChatWindow heroData={heroData} />
    </main>
  )
}
