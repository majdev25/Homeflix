import { IoIosStar } from "react-icons/io";
import IconComponent from "./IconComponent";

interface RatingProps {
  rating?: number;
}

function Rating({ rating }: RatingProps) {
  return (
    <div className="flex gap-1 items-center text-xs">
      <div>
        <IconComponent
          icon={IoIosStar}
          className="text-yellow-400 drop-shadow-[0_0_4px_rgba(250,204,21,0.7)]"
        />
      </div>
      <div className="pt-[1.5px]">
        <span className="font-bold">{rating}</span> / 10
      </div>
    </div>
  );
}

export default Rating;
