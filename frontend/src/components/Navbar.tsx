import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export function Navbar() {
  return (
    <nav className="bg-primary text-primary-foreground p-4">
      <ul className="flex space-x-4">
        <li>
          <Link to="/trips" className={cn("hover:underline")}>
            Trips
          </Link>
        </li>
        <li>
          <Link to="/items" className={cn("hover:underline")}>
            Items
          </Link>
        </li>
        <li>
          <Link to="/luggage" className={cn("hover:underline")}>
            Luggage
          </Link>
        </li>
      </ul>
    </nav>
  );
}