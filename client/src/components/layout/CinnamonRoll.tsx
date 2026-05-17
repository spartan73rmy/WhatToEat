import { motion } from "framer-motion";

export default function CinnamonRoll() {
  return (
    <motion.div
      className="fixed bottom-4 right-4 text-4xl cursor-pointer select-none z-50"
      animate={{ x: [0, -20, 0] }}
      transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
      whileHover={{ scale: 1.3, rotate: 15 }}
    >
      🥮
    </motion.div>
  );
}
