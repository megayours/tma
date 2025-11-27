import { AiOutlineRetweet } from 'react-icons/ai';

export function Reshared({ amount }: { amount: number }) {
  return (
    <div className="bg-tg-secondary-bg/50 text-tg-hint flex items-center gap-1 rounded-full px-2 py-1">
      <AiOutlineRetweet className="h-3.5 w-3.5" />
      <span className="text-[11px] font-medium">{amount}</span>
    </div>
  );
}
