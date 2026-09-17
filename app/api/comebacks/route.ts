import { NextRequest, NextResponse } from 'next/server';

const COMEBACK_TEMPLATES = [
  (msg: string) => `Bhai said "${msg.slice(0, 30)}..." and thought I'd care? Cute. ☕️`,
  (msg: string) => `Anonymous flex kar raha hai but main character energy mere paas hai. Periodt. 💅`,
  (msg: string) => `Someone's brave behind a screen. Come say it to my face? Oh wait... you can't. 👀`,
  (msg: string) => `Reading this from my penthouse of opinions while sipping chai. Keep em coming. 🍵`,
  (msg: string) => `This tea? Lukewarm at best. Next time bring the heat. 🔥`,
  (msg: string) => `Anonymous messaging me like I won't screenshot and post. Bold move. 😏`,
  (msg: string) => `You: "${msg.slice(0, 25)}..." Me: unbothered, moisturized, in my lane, flourishing. 💁‍♀️`,
  (msg: string) => `Arre waah, kya feedback hai! Let me write it down in my "things I care about" notebook. Oh wait, it's empty. 📓`,
  (msg: string) => `Anonymous energy is giving "too scared to show face" vibes. Noted. 📝`,
  (msg: string) => `This message has been reviewed by my team and we've decided we don't care. Next! 🚀`,
];

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Generate 3 random comebacks from templates
    const shuffled = [...COMEBACK_TEMPLATES].sort(() => Math.random() - 0.5);
    const comebacks = shuffled.slice(0, 3).map((fn) => fn(message));

    return NextResponse.json({ comebacks });
  } catch {
    return NextResponse.json(
      { error: 'Failed to generate comebacks' },
      { status: 500 }
    );
  }
}
