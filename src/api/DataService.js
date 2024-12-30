import {transformData} from "../transformer.js";

const urls = import.meta.env.VITE_REGIONAL_API_URLS || "";
const REGIONS = urls
    .split(", ")
    .map((entry) => {
        const match = entry.match(/(.+?)\[(.+?)\]/);
        return match ? {url: match[1], label: match[2]} : null;
    })
    .filter(Boolean);

/**
 * Class for handling API data fetching.
 */
class DataService {

    /**
     * Fetches the pool details.
     * @returns {Promise<Object[]>} A promise that resolves to an array of data
     * @throws {Error} If the request fails.
     */
    static async fetchPoolDetails() {
        try {
            const responses = await Promise.all(
                REGIONS.map(async (region) => {
                    try {
                        const res = await fetch(`${region.url}/transcoders`);
                        if (!res.ok) throw new Error(`Failed to fetch ${region.label}`);
                        const data = await res.json();
                        return {
                            region: region.label,
                            isRegionDown: false,
                            nodes: data.map((node) => ({...node, region: region.label})),
                        };
                    } catch (error) {
                        return {region: region.label, isRegionDown: true, nodes: []};
                    }
                })
            );
            return transformData(responses);
        } catch (error) {
            return null;
        }
    }
}

export default DataService;
