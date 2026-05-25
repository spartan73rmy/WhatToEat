import { motion } from "framer-motion";

export default function CinnamonRoll() {
  return (
    <div className="fixed bottom-0 left-0 w-full overflow-hidden pointer-events-none h-20 z-0">
      <motion.div
        className="absolute bottom-2 text-5xl pointer-events-auto cursor-pointer select-none"
        animate={{
          x: ["-120px", "calc(100vw + 120px)"],
        }}
        transition={{
          duration: 14,
          repeat: Infinity,
          ease: "linear",
        }}
        whileHover={{
          scale: 1.3,
          rotate: [0, -10, 10, -10, 0],
          transition: { duration: 0.4 },
        }}
      >
        🥮
      </motion.div>
    </div>
  );
}
