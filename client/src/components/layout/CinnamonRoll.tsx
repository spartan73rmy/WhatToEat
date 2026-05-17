import { motion } from "framer-motion";

const GIF_URL =
  "https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExa3VrbXZhaGplcHd1cWFqamtxN3doejZ4ZmQ5ajB6OWJhb2dndnRzayZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/xKRa4f8OO5jiw/giphy.gif";

export default function CinnamonRoll({ onClick }: { onClick: () => void }) {
  return (
    <motion.div
      className="fixed bottom-0 right-0 w-48 h-48 cursor-pointer z-40"
      animate={{ y: [0, -6, 0] }}
      transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
      onClick={onClick}
    >
      <div className="w-full h-full [mask-image:radial-gradient(ellipse_130%_130%_at_80%_90%,black_35%,transparent_75%)] [-webkit-mask-image:radial-gradient(ellipse_130%_130%_at_80%_90%,black_35%,transparent_75%)]">
        <img
          src={GIF_URL}
          alt=""
          className="w-full h-full object-cover"
        />
      </div>
    </motion.div>
  );
}
