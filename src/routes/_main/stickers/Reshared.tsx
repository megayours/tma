import { AiOutlineRetweet } from 'react-icons/ai';

export function Reshared({ amount }: { amount: number }) {
  return (
    <div className="bg-tg-secondary-bg/50 text-tg-hint flex h-full items-center justify-center gap-1 rounded-full px-2">
      <AiOutlineRetweet className="h-6 w-6" />
      <span className="text-[11px] font-medium">{amount}</span>
    </div>
  );
}
