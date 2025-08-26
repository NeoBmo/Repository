import { useEffect, useState, useRef } from "react";

export default function TypingAnimation({
  texts = [""],
  typingSpeed = 0,
  pauseBetween = 0,
  deleteSpeed = 0,
  initialDelay = 0,
}) {
  const [display, setDisplay] = useState("");
  const [cursorVisible, setCursorVisible] = useState(true);
  const textIndex = useRef(0);
  const charIndex = useRef(0);
  const deleting = useRef(false);
  const animationStarted = useRef(false);
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setCursorVisible((prev) => !prev);
    }, 500);
    return () => clearInterval(cursorInterval);
  }, []);
  useEffect(() => {
    if (animationStarted.current) return;
    const startAnimation = () => {
      animationStarted.current = true;
      const updateText = () => {
        const fullText = texts[textIndex.current];
        if (!deleting.current) {
          setDisplay(fullText.slice(0, charIndex.current + 1));
          charIndex.current++;
          if (charIndex.current === fullText.length) {
            deleting.current = true;
            setTimeout(updateText, pauseBetween);
            return;
          }
        } else {
          setDisplay(fullText.slice(0, charIndex.current - 1));
          charIndex.current--;
          if (charIndex.current === 0) {
            deleting.current = false;
            textIndex.current = (textIndex.current + 1) % texts.length;
          }
        }
        setTimeout(updateText, deleting.current ? deleteSpeed : typingSpeed);
      };
      updateText();
    };
    const delayTimer = setTimeout(startAnimation, initialDelay);
    return () => clearTimeout(delayTimer);
  }, [texts, typingSpeed, deleteSpeed, pauseBetween, initialDelay]);
  return (
    <span
      className="text-neutral-400 text-xl mb-2 w-auto"
      style={{ whiteSpace: "pre", display: "inline-block" }}
    >
      {display}
      <span
        className="text-pink-400"
        style={{
          display: "inline-block",
          width: "4px",
          visibility: cursorVisible ? "visible" : "hidden",
        }}
      >
        |
      </span>
    </span>
  );
}
