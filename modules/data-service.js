
/********************************************************************************
*  WEB322 – Assignment 05
* 
*  I declare that this assignment is my own work in accordance with Seneca's
*  Academic Integrity Policy:
* 
*  https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
* 
*  Name: _Preeya Sursai__ Student ID: __180121238____________ Date: __Mar 25,2025_________
*
*  Published URL: 
*
********************************************************************************/


require('dotenv').config();
const { Sequelize, DataTypes, Op } = require('sequelize');

// Set up Sequelize connection
const sequelize = new Sequelize(process.env.DB_DATABASE, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    dialectOptions: {
        ssl: { require: true, rejectUnauthorized: false } // Required for Neon.tech
    },
});

// Define ProvinceOrTerritory Model
const ProvinceOrTerritory = sequelize.define('ProvinceOrTerritory', {
    code: { type: DataTypes.STRING, primaryKey: true },
    name: DataTypes.STRING,
    type: DataTypes.STRING,
    region: DataTypes.STRING,
    capital: DataTypes.STRING
}, { timestamps: false });

// Define Site Model
const Site = sequelize.define('Site', {
    siteId: { type: DataTypes.STRING, primaryKey: true },
    site: DataTypes.STRING,
    description: DataTypes.TEXT,
    date: DataTypes.INTEGER,
    dateType: DataTypes.STRING,
    image: DataTypes.STRING,
    location: DataTypes.STRING,
    latitude: DataTypes.FLOAT,
    longitude: DataTypes.FLOAT,
    designated: DataTypes.INTEGER,
    provinceOrTerritoryCode: DataTypes.STRING
}, { timestamps: false });

// Establish Relationship
Site.belongsTo(ProvinceOrTerritory, { foreignKey: 'provinceOrTerritoryCode' });

async function initialize() {
    try {
        await sequelize.sync();
        console.log("Database synced!");

        // Insert Provinces & Territories only if the table is empty
        const provinceCount = await ProvinceOrTerritory.count();
        if (provinceCount === 0) {
            await ProvinceOrTerritory.bulkCreate(provinceAndTerritoryData);
            console.log(" Provinces & Territories inserted!");
        }

        // Insert Sites only if the table is empty
        const siteCount = await Site.count();
        if (siteCount === 0) {
            await Site.bulkCreate(siteData);
            console.log(" Sites inserted!");
        }

    } catch (err) {
        console.error("Database error:", err.message);
        console.log(" If you see a foreign key error, check that every `provinceOrTerritoryCode` in NHSiteData.json exists in provinceAndTerritoryData.json.");
    }
}


//  Get All Sites
function getAllSites() {
    return Site.findAll({
        include: [ProvinceOrTerritory]
    }).then(sites => {
        if (sites.length > 0) return sites;
        throw "No site data available";
    });
}

// Get Site By ID
function getSiteById(id) {
    return Site.findOne({
        where: { siteId: id },
        include: [ProvinceOrTerritory]
    }).then(site => {
        if (site) return site;
        throw "Site not found";
    });
}

//  Get Sites By Province/Territory Name
function getSitesByProvinceOrTerritoryName(name) {
    return Site.findAll({
        include: [ProvinceOrTerritory],
        where: { '$ProvinceOrTerritory.name$': { [Op.iLike]: `%${name}%` } }
    }).then(sites => {
        if (sites.length > 0) return sites;
        throw "No sites found for this province/territory";
    });
}

//  Get Sites By Region
function getSitesByRegion(region) {
    return Site.findAll({
        include: [ProvinceOrTerritory],
        where: { '$ProvinceOrTerritory.region$': { [Op.iLike]: `%${region}%` } }
    }).then(sites => {
        if (sites.length > 0) return sites;
        throw "No sites found for this region";
    });
}

//  Get All Provinces & Territories (For Dropdown)
function getAllProvincesAndTerritories() {
    return ProvinceOrTerritory.findAll()
        .then(provinces => provinces)
        .catch(err => {
            console.error("Error fetching provinces:", err);
            throw err;
        });
}

// Add New Site
function addSite(siteData) {
    return Site.create(siteData)
        .then(() => console.log("New site added!"))
        .catch(err => {
            console.error(" Error adding site:", err);
            throw err.errors ? err.errors[0].message : err;
        });
}

// Edit Existing Site
function editSite(id, siteData) {
    return Site.update(siteData, { where: { siteId: id } })
        .then(rowsUpdated => {
            if (rowsUpdated[0] > 0) {
                console.log(`Site ${id} updated!`);
                return;
            }
            throw "Site not found.";
        })
        .catch(err => {
            console.error("Error editing site:", err);
            throw err.errors ? err.errors[0].message : err;
        });
}

// Delete Site
function deleteSite(id) {
    return Site.destroy({ where: { siteId: id } })
        .then(deleted => {
            if (deleted) {
                console.log(` Site ${id} deleted!`);
                return;
            }
            throw "Site not found.";
        })
        .catch(err => {
            console.error("Error deleting site:", err);
            throw err;
        });
}

// Function to get the count of sites
function getSiteCount() {
    return Site.count();  // Counts the total number of sites in the database
}

module.exports = { 
    initialize, getAllSites, getSiteById, getSitesByProvinceOrTerritoryName, 
    getSitesByRegion, getAllProvincesAndTerritories, addSite, editSite, deleteSite, getSiteCount
};