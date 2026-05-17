import { Star } from "lucide-react";

interface RatingStarsProps {
  rating: number | null;
  onChange?: (rating: number) => void;
  readonly?: boolean;
}

export default function RatingStars({ rating, onChange, readonly }: RatingStarsProps) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          className={`transition-colors ${
            readonly ? "cursor-default" : "cursor-pointer hover:scale-110"
          }`}
        >
          <Star
            size={14}
            className={
              star <= (rating || 0)
                ? "fill-amber-400 text-amber-400"
                : "text-gray-300"
            }
          />
        </button>
      ))}
    </div>
  );
}
