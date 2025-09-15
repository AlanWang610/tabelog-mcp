/**
 * Price range options for filtering
 */
export interface PriceRange {
    min?: number;
    max?: number;
}

/**
 * Arguments for tabelog_top tool
 */
export interface TabelogTopArgs {
    region?: string;
    limit?: number;
    priceRange?: PriceRange;
}

/**
 * Arguments for tabelog_snapshot tool
 */
export interface TabelogSnapshotArgs {
    region?: string;
}

/**
 * Restaurant data structure
 */
export interface Restaurant {
    name: string;
    rating: string;
    url: string;
    cuisine: string;
    price: string;
    location: string;
    rank: number;
}

/**
 * Tabelog API response structure
 */
export interface TabelogResponse {
    region: string;
    count: number;
    restaurants: Restaurant[];
}

/**
 * Configuration interface
 */
export interface Config {
    port: number;
    isProduction: boolean;
}
