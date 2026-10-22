"use client";
import { useEffect } from "react";
import { motion, stagger, useAnimate } from "framer-motion";
import { cn } from "../../utils/cn";

export const TextGenerateEffect = ({ words, className }: { words: string; className?: string }) => {
  const [scope, animate] = useAnimate();
  let wordsArray = words.split(" ");
  useEffect(() => {
    animate(
      "span",
      {
        opacity: 1,
      },
      {
        duration: 2,

        delay: stagger(0.2),
      },
    );
  }, [scope.current]);

  /**
   * Renders a list of words inside a motion div element, with each word wrapped in a motion span element.
   *
   * @return {JSX.Element} The rendered list of words as a React JSX element.
   */

  const renderWords = () => {
    return (
      <motion.div ref={scope}>
        {wordsArray.map((word, idx) => {
          return (
            <motion.span
              key={word + idx}
              className="text-black opacity-0 dark:text-[#aaaaaa]"
              style={{ textTransform: "capitalize" }}
            >
              {word}{" "}
            </motion.span>
          );
        })}
      </motion.div>
    );
  };

  return (
    <div className={cn("font-medium lowercase", className)}>
      <div className="mt-4">
        <div className="text-2xl leading-snug tracking-wide text-black dark:text-[#aaaaaa]">
          {renderWords()}
        </div>
      </div>
    </div>
  );
};
