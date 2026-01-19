import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import type { MemeTemplateTextAnchor, MemeTextInput } from '@/types/meme';

interface UseMemeTextInputsProps {
  textAnchors: MemeTemplateTextAnchor[];
  urlParams: Record<string, any>;
}

/**
 * Manages text input state for meme text anchors
 * - Initialize from URL params (text_0, text_1, etc.)
 * - Sync text values to URL params on change
 * - Convert to MemeTextInput[] format for API
 * - Track validation state
 */
export function useMemeTextInputs({
  textAnchors,
  urlParams,
}: UseMemeTextInputsProps) {
  const navigate = useNavigate();

  // Initialize from URL params
  const [texts, setTexts] = useState<string[]>(() =>
    textAnchors.map((_, i) => {
      const paramValue = urlParams[`text_${i}`];
      return typeof paramValue === 'string' ? paramValue : '';
    })
  );

  // Reset texts when textAnchors change (e.g., template switch)
  useEffect(() => {
    setTexts(
      textAnchors.map((_, i) => {
        const paramValue = urlParams[`text_${i}`];
        return typeof paramValue === 'string' ? paramValue : '';
      })
    );
  }, [textAnchors.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // Update individual text and sync to URL
  const updateText = (anchorIndex: number, text: string) => {
    if (anchorIndex < 0 || anchorIndex >= textAnchors.length) {
      console.error('Invalid anchor index:', anchorIndex);
      return;
    }

    const newTexts = [...texts];
    newTexts[anchorIndex] = text;
    setTexts(newTexts);

    // Update URL params
    const params: Record<string, string> = { ...urlParams };

    // Add or remove text params
    newTexts.forEach((t, i) => {
      if (t && t.trim().length > 0) {
        params[`text_${i}`] = t;
      } else {
        delete params[`text_${i}`];
      }
    });

    navigate({ to: '.', search: params, replace: true });
  };

  // Convert to API format (only include non-empty texts)
  const textInputs = useMemo((): MemeTextInput[] => {
    return texts
      .map((text, index) =>
        text && text.trim().length > 0
          ? { anchor_index: index, text: text.trim() }
          : null
      )
      .filter((t): t is MemeTextInput => t !== null);
  }, [texts]);

  // Validation: check if all text fields are filled
  const allTextsFilled = texts.every(t => t && t.trim().length > 0);

  // Check if there are any texts entered
  const hasAnyText = texts.some(t => t && t.trim().length > 0);

  return {
    texts,
    updateText,
    textInputs,
    textAnchors,
    allTextsFilled,
    hasAnyText,
  };
}

export type MemeTextInputsState = ReturnType<typeof useMemeTextInputs>;
