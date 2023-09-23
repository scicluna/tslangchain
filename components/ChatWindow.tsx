"use client"
import { Message, useChat } from 'ai/react';
import { useEffect, useRef, useState } from 'react';
import { PlayerBlock } from '@/utils/player';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"

export default function Chatwindow() {
    const [player, setPlayer] = useState<PlayerBlock>(new PlayerBlock())
    const { messages, input, handleInputChange, handleSubmit, isLoading, } = useChat({
        onFinish: (message => updatePlayer(message, player))
    });

    const chatContainer = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!chatContainer.current) return;

        const { scrollTop, scrollHeight, clientHeight } = chatContainer.current;
        const diff = scrollHeight - (scrollTop + clientHeight);
        const threshold = 30;
        const isAtBottom = diff <= threshold;

        if (isAtBottom) {
            chatContainer.current.scrollTo({
                top: scrollHeight,
                behavior: "smooth",
            });
        }
    }, [messages]);

    async function updatePlayer(message: Message, player: PlayerBlock) {
        if (message && message.role === 'assistant') {
            // React to "Level Up"
            if (message.content.includes("Level Up")) {
                player.lvl += 1;
            }

            // React to "Loot: {object}"
            const lootMatch = message.content.match(/Loot: \{item: (.*?), quantity: (\d+), type: (.*?)\}/);
            if (lootMatch) {
                const item = {
                    item: lootMatch[1].trim(),
                    quantity: parseInt(lootMatch[2], 10),
                    type: lootMatch[3].trim()
                };
                player.addToInventory(item);
            }


            // React to "Entry: ..."
            const entryMatch = message.content.match(/Entry: (.*)/);
            if (entryMatch) {
                const entry = entryMatch[1];
                player.journal.push({ number: player.journal.length, entry });
            }
        }

        await fetch('/api/player', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                str: player.str,
                dex: player.dex,
                con: player.con,
                int: player.int,
                wis: player.wis,
                cha: player.cha,
                lvl: player.lvl,
                hp: player.hp,
                ac: player.ac,
                atk: player.atk,
                dmg: player.dmg,
                wpn: player.wpn,
                armor: player.armor,
                inventory: player.inventory,
                journal: player.journal
            })
        })
        setPlayer(player)
    }

    return (
        <div className="mx-auto w-full flex flex-col relative">
            <div className='flex gap-2 w-full h-full p-2'>
                <div className='h-[80dvh] w-2/3 flex flex-col gap-4 overflow-auto bg-gray-400 bg-opacity-30' ref={chatContainer}>
                    {messages.map((m, i) => (
                        <div key={m.id} className='flex flex-col p-2'>
                            <p className='font-extrabold'>{m.role === 'user' ? 'User: ' : 'AI: '}</p>
                            <p>{m.content}</p>
                        </div>
                    ))}
                </div>
                <div className='bg-gray-400 w-1/2 h-[80dvh]'>

                </div>
            </div>

            <form onSubmit={handleSubmit} className='h-[10dvh] fixed w-full bottom-0 flex gap-4 justify-center items-center'>
                <input
                    className="border border-gray-300 rounded shadow-xl p-2 w-1/3"
                    value={input}
                    onChange={handleInputChange}
                    name="prompt"
                    placeholder='What do you do?'
                />
                <button className='bg-purple-600 p-2 rounded-lg hover:bg-purple-500' type="submit" disabled={isLoading}>Send</button>
            </form>

            <Sheet>
                <SheetTrigger className='fixed bottom-0 left-2 p-2 h-[10dvh] text-2xl font-extrabold  underline hover:text-gray-600'>Character Sheet</SheetTrigger>
                <SheetContent side={'bottom'} className='h-[20dvh]'>
                    <SheetHeader>
                        <SheetDescription>
                            <div className='flex gap-8'>
                                <div className='flex flex-col text-justify'>
                                    <SheetTitle>Hero</SheetTitle>
                                    <p>str: {player.str} ({Math.floor((player.str - 10) / 2)})</p>
                                    <p>dex: {player.dex} ({Math.floor((player.dex - 10) / 2)})</p>
                                    <p>con: {player.con} ({Math.floor((player.con - 10) / 2)})</p>
                                    <p>int: {player.int} ({Math.floor((player.int - 10) / 2)})</p>
                                    <p>wis: {player.wis} ({Math.floor((player.wis - 10) / 2)})</p>
                                    <p>cha: {player.cha} ({Math.floor((player.cha - 10) / 2)})</p>
                                </div>
                                <div className='flex flex-col text-justify'>
                                    <SheetTitle>Attributes</SheetTitle>
                                    <p>hp: {player.hp}/{player.hp}</p>
                                    <p>ac: {player.ac}</p>
                                    <p>atk: {player.atk}</p>
                                    <p>dmg: {player.dmg}</p>
                                    <p>wpn: {player.wpn}</p>
                                    <p>armor: {player.armor}</p>
                                </div>
                                <div className='flex flex-col text-justify w-1/2 flex-wrap'>
                                    <SheetTitle>Inventory</SheetTitle>
                                    {player.inventory.map(item => (
                                        <p key={item.item} className='w-fit'> {item.quantity}x {item.item} {item.type} {item.stat ?? null}</p>
                                    ))}
                                </div>
                                <div className='flex flex-col text-justify overflow-auto'>
                                    <SheetTitle>Journal</SheetTitle>
                                    {player.journal.map(entry => (
                                        <p key={entry.number}>{entry.entry}</p>
                                    ))}
                                </div>
                            </div>
                        </SheetDescription>
                    </SheetHeader>
                </SheetContent>
            </Sheet>

        </div>
    );
}