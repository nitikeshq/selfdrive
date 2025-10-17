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
  onChange: (value: string, placeId?: string | null, lat?: string | null, lng?: string | null) => void;
  placeholder?: string;
  restrictToBhubaneswar?: boolean;
  testId?: string;
}

export default function GooglePlacesAutocomplete({
  value,
  onChange,
  placeholder = "Enter location",
  restrictToBhubaneswar = true,
  testId,
}: GooglePlacesAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [inputValue, setInputValue] = useState(value);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";
  const hasApiKey = apiKey.length > 0;

  // Only load Google Maps if we have an API key
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey,
    libraries,
    preventGoogleFontsLoading: true,
    id: "google-maps-script",
  });

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    if (!hasApiKey || !isLoaded || !inputRef.current || loadError) return;

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
      options.strictBounds = false;
    }

    try {
      autocompleteRef.current = new google.maps.places.Autocomplete(
        inputRef.current,
        options
      );

      autocompleteRef.current.addListener("place_changed", () => {
        const place = autocompleteRef.current?.getPlace();
        
        if (place && place.geometry && place.geometry.location) {
          const address = place.formatted_address || place.name || "";
          const placeId = place.place_id || "";
          const lat = place.geometry.location.lat().toString();
          const lng = place.geometry.location.lng().toString();

          setInputValue(address);
          onChange(address, placeId, lat, lng);
        }
      });
    } catch (error) {
      console.error("Error initializing Google Places Autocomplete:", error);
    }

    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [hasApiKey, isLoaded, loadError, onChange, restrictToBhubaneswar]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
  };

  // Always render as regular input - Google Places enhances it when available
  return (
    <Input
      ref={hasApiKey && isLoaded && !loadError ? inputRef : null}
      value={inputValue}
      onChange={handleInputChange}
      placeholder={placeholder}
      data-testid={testId}
    />
  );
}
