import { useEffect, useRef, useState } from "react";
import { useLoadScript } from "@react-google-maps/api";
import { Input } from "@/components/ui/input";

const libraries: ("places")[] = ["places"];

interface PlaceDetails {
  address: string;
  placeId: string;
  lat: number;
  lng: number;
}

interface GooglePlacesAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onPlaceSelect?: (details: PlaceDetails) => void;
  placeholder?: string;
  restrictToBhubaneswar?: boolean;
  testId?: string;
}

export default function GooglePlacesAutocomplete({
  value,
  onChange,
  onPlaceSelect,
  placeholder = "Enter location",
  restrictToBhubaneswar = true,
  testId,
}: GooglePlacesAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [inputValue, setInputValue] = useState(value);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
    libraries,
  });

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    if (!isLoaded || !inputRef.current) return;

    // Bhubaneswar coordinates for location bias
    const bhubaneswarBounds = {
      north: 20.3617,
      south: 20.1972,
      east: 85.9152,
      west: 85.7343,
    };

    const options: google.maps.places.AutocompleteOptions = {
      fields: ["formatted_address", "geometry", "place_id", "name"],
      componentRestrictions: { country: "in" },
    };

    // Restrict to Bhubaneswar area if enabled
    if (restrictToBhubaneswar) {
      options.bounds = bhubaneswarBounds;
      options.strictBounds = false; // Allow selection outside bounds but prioritize inside
    }

    autocompleteRef.current = new google.maps.places.Autocomplete(
      inputRef.current,
      options
    );

    autocompleteRef.current.addListener("place_changed", () => {
      const place = autocompleteRef.current?.getPlace();
      
      if (place && place.geometry && place.geometry.location) {
        const address = place.formatted_address || place.name || "";
        const placeId = place.place_id || "";
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();

        setInputValue(address);
        onChange(address);

        if (onPlaceSelect) {
          onPlaceSelect({
            address,
            placeId,
            lat,
            lng,
          });
        }
      }
    });

    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [isLoaded, onChange, onPlaceSelect, restrictToBhubaneswar]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
  };

  if (loadError) {
    return (
      <Input
        value={inputValue}
        onChange={handleInputChange}
        placeholder={placeholder}
        data-testid={testId}
      />
    );
  }

  if (!isLoaded) {
    return (
      <Input
        value={inputValue}
        onChange={handleInputChange}
        placeholder="Loading Google Maps..."
        disabled
        data-testid={testId}
      />
    );
  }

  return (
    <Input
      ref={inputRef}
      value={inputValue}
      onChange={handleInputChange}
      placeholder={placeholder}
      data-testid={testId}
    />
  );
}
