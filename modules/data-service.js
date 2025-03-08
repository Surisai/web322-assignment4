// Load JSON data
const siteData = require("../data/NHSiteData.json");
const provinceAndTerritoryData = require("../data/provinceAndTerritoryData.json");

// Array to store processed site data
let sites = [];

// Initialize function
function initialize() {
    return new Promise((resolve, reject) => {
        try {
            sites = siteData.map(site => {
                return {
                    ...site,
                    provinceOrTerritoryObj: provinceAndTerritoryData.find(pt => pt.code === site.provinceOrTerritoryCode)
                };
            });
            resolve();
        } catch (error) {
            reject("Error initializing site data");
        }
    });
}

// Return all sites
function getAllSites() {
    return new Promise((resolve, reject) => {
        sites.length > 0 ? resolve(sites) : reject("No site data available");
    });
}

// Find site by ID
function getSiteById(id) {
    return new Promise((resolve, reject) => {
        const site = sites.find(s => s.siteId === id);
        site ? resolve(site) : reject("Site not found");
    });
}

// Find sites by province/territory name
function getSitesByProvinceOrTerritoryName(name) {
    return new Promise((resolve, reject) => {
        const filteredSites = sites.filter(s => s.provinceOrTerritoryObj.name.toLowerCase().includes(name.toLowerCase()));
        filteredSites.length > 0 ? resolve(filteredSites) : reject("No sites found for this province/territory");
    });
}

// Find sites by region
function getSitesByRegion(region) {
    return new Promise((resolve, reject) => {
        const filteredSites = sites.filter(s => s.provinceOrTerritoryObj.region.toLowerCase().includes(region.toLowerCase()));
        filteredSites.length > 0 ? resolve(filteredSites) : reject("No sites found for this region");
    });
}

// Export functions
module.exports = { initialize, getAllSites, getSiteById, getSitesByProvinceOrTerritoryName, getSitesByRegion };
