export interface ListingDetails {
  vat_excluded?: boolean;
  max_speed_kmh?: number;
  engine?: {
    manufacturer?: string;
    emissions_standard?: string;
  };
  transmission_details?: {
    creeper?: boolean;
    drive_type?: string;
    reversible?: boolean;
    forward_gears?: number;
    reverse_gears?: number;
    type?: string;
  };
  cabin?: {
    cabin?: boolean;
    air_conditioning?: boolean;
  };
  pto?: {
    rear_pto_rpm?: string;
  };
  rear_hitch?: {
    three_point_category?: string;
  };
  hydraulics?: {
    isobus?: boolean;
  };
  tires?: {
    front_left?: string;
    front_right?: string;
    rear_left?: string;
    rear_right?: string;
    front?: string;
    rear?: string;
  };
}

export interface Listing {
  id: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  currency: string;
  hours_used: number | null;
  horsepower: number | null;
  condition: "new" | "used" | "refurbished";
  location: string;
  country: string;
  description: string;
  images: string[];
  transmission: string | null;
  drive_type: string | null;
  details?: ListingDetails;
}

export interface InquiryPayload {
  listing_id: string;
  listing_title: string;
  name: string;
  email: string;
  phone: string;
  message: string;
}
