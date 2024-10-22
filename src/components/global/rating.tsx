import { Star } from "lucide-react";

interface RatingProps {
    rating: number;
}

const Rating = (props: RatingProps) => {
    const { rating } = props;

    // Ensure the rating is a valid number between 1 and 5
    const safeRating = Math.min(Math.max(rating, 1), 5);

    return (
        <div style={{ display: 'flex' }}>
            {Array.from({ length: 5 }, (_, i) => (
                <Star
                    key={i}
                    fill={i < safeRating ? "gold" : "none"}
                    stroke={i < safeRating ? "gold" : "hsl(var(--primary))"}
                />
            ))}
        </div>
    );
};

export default Rating;
