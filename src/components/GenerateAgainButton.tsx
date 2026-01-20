import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@telegram-apps/telegram-ui';
import { useSession } from '@/auth/SessionProvider';
import { useGenerateContentMutation } from '@/hooks/useContents';
import type { Content } from '@/types/content';
import { FaRedo } from 'react-icons/fa';
import { exec } from 'child_process';

interface GenerateAgainButtonProps {
  execution: Content | undefined;
  promptId: string;
}

export function GenerateAgainButton({
  execution,
  promptId,
}: GenerateAgainButtonProps) {
  const { session } = useSession();
  const navigate = useNavigate();
  const generateMutation = useGenerateContentMutation(session);

  // Navigate to processing page on successful generation
  useEffect(() => {
    if (generateMutation.isSuccess && generateMutation.data) {
      navigate({
        to: '/content/$promptId/processing/$executionId',
        params: {
          promptId,
          executionId: generateMutation.data.execution_id,
        },
      });
    }
  }, [generateMutation.isSuccess, generateMutation.data, navigate, promptId]);

  const handleGenerateAgain = () => {
    if (!execution) return;

    // Handle both single token and multiple tokens formats
    const tokensArray =
      execution.tokens || (execution.token ? [execution.token] : []);
    console.log('Tokens for regeneration:', execution, tokensArray);

    if (tokensArray.length === 0) {
      console.error('No tokens found in execution');
      return;
    }

    // Build inputs array from the tokens
    const inputs = tokensArray.map(token => ({
      chain: token.contract.chain,
      contract_address: token.contract.address,
      token_id: token.id,
    }));

    generateMutation.mutate({
      promptId: execution.promptId?.toString() || promptId,
      type: execution.type,
      inputs: inputs,
      overrideExisting: true,
    });
  };

  return (
    <div>
      <Button
        mode="plain"
        size="s"
        onClick={handleGenerateAgain}
        disabled={!execution || generateMutation.isPending}
      >
        <div className="text-tg-link flex flex-row items-center justify-center gap-1.5">
          <FaRedo
            className={`text-xs ${generateMutation.isPending ? 'animate-spin' : ''}`}
          />
          <span className="text-xs">
            {generateMutation.isPending ? 'Generating...' : 'Generate Again'}
          </span>
        </div>
      </Button>
    </div>
  );
}
