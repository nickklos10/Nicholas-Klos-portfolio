"use client";

import { useEffect, useState, useRef } from "react";
import styles from "./TypeAnimation.module.css";

const roles = ["a Software Engineer", "a Data Engineer", "a Data Scientist"];

export default function TypeAnimation() {
  const [currentRoleIndex, setCurrentRoleIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [text, setText] = useState("");
  const [typingSpeed, setTypingSpeed] = useState(100);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const currentRole = roles[currentRoleIndex];

    const handleTyping = () => {
      // If deleting
      if (isDeleting) {
        setText((current) => current.substring(0, current.length - 1));
        setTypingSpeed(50);

        // When finished deleting, start typing the next word
        if (text === "") {
          setIsDeleting(false);
          setCurrentRoleIndex((prev) => (prev + 1) % roles.length);
          setTypingSpeed(150);
        }
      }
      // If typing
      else {
        setText((current) => currentRole.substring(0, current.length + 1));
        setTypingSpeed(100);

        // When finished typing current word, wait then start deleting
        if (text === currentRole) {
          setTypingSpeed(2000); // Longer pause at the end of a word
          setIsDeleting(true);
        }
      }
    };

    timerRef.current = setTimeout(handleTyping, typingSpeed);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [text, isDeleting, currentRoleIndex]);

  return (
    <div className={styles.typeAnimation}>
      I'm <span dangerouslySetInnerHTML={{ __html: text }} />
      <span className={styles.cursor}></span>
    </div>
  );
}
