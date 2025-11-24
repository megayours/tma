import { AiOutlineRetweet } from 'react-icons/ai';

export function Reshared({ amount }: { amount: number }) {
  console.log('Sticker pack in Reshared:', amount);
  return (
    <div className="flex h-full w-full flex-col items-center justify-center align-middle">
      <AiOutlineRetweet className="h-full w-full" />
      <span className="text-sm">{amount}</span>
    </div>
  );
}
