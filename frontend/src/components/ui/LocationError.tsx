import { MapPin } from "lucide-react";

interface LocationErrorProps {
    errorMessage: string;
}

export const LocationError = ({ errorMessage }: LocationErrorProps) => (
    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
        <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
            <MapPin className="w-8 h-8 text-red-500" />
        </div>
        <p className="text-lg font-bold text-[var(--color-text-primary)]">
            Location Access Required
        </p>
        <p className="text-[var(--color-text-muted)] mt-1">{errorMessage}</p>
    </div>
)

