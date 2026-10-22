import { TextGenerateEffect } from "./ui/text-generate-effect";
import React from "react";

interface TextGenerateEffectDemoProps {
  words: string;
  className?: string;
}

export function TextGenerateEffectDemo({ words, className }: TextGenerateEffectDemoProps) {
  return <TextGenerateEffect words={words} className={className} />;
}
