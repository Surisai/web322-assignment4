/********************************************************************************
*  WEB322 – Assignment 04
* 
*  I declare that this assignment is my own work in accordance with Seneca's
*  Academic Integrity Policy:
* 
*  https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
* 
*  Name: _Preeya Surisai________ Student ID: __180121238___ Date: March 9, 2025_____________
*
*  Published URL: [Your Published URL Here]
*
********************************************************************************/

const express = require("express");
const path = require("path");
const app = express();
const siteData = require("./modules/data-service");

const HTTP_PORT = process.env.PORT || 8080;

// Set EJS as the view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Serve static files
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "images")));

// Routes
app.get("/", (req, res) => {
        res.send("Assignment 4: Preeya Surisai - 180121238");
   
});

app.get("/home", (req, res) => {
    siteData.getAllSites()
        .then(sites => {
            // Pass only the first 3 sites to the home.ejs view
            const firstThreeSites = sites.slice(0, 3);
            res.render("home", { page: "/", sites: firstThreeSites });
        })
        .catch(err => {
            console.error("Error fetching sites:", err);
            res.status(500).render("404", { message: "Failed to load site data." });
        });
});

app.get("/about", (req, res) => {
    res.render("about", { page: "/about" });
});

//fetch the all data to main before
app.get("/sites", (req, res) => {
    if (req.query.region) {
        // Fetch sites by region
        siteData.getSitesByRegion(req.query.region)
            .then(sites => {
                sites.sort((a, b) => a.location.localeCompare(b.location));
                res.render("sites", { page: "/sites", sites: sites, filter: req.query.region });
            })
            .catch(err => res.status(404).render("404", { message: "No sites found for the specified region." }));
    } else if (req.query.provinceOrTerritory) {
        // Fetch sites by province/territory
        siteData.getSitesByProvinceOrTerritoryName(req.query.provinceOrTerritory)
            .then(sites => {
                sites.sort((a, b) => a.location.localeCompare(b.location));
                res.render("sites", { page: "/sites", sites: sites, filter: req.query.provinceOrTerritory });
            })
            .catch(err => res.status(404).render("404", { message: "No sites found for the specified province or territory." }));
    } else {
        // Default: Show all sites sorted by location (A-Z)
        siteData.getAllSites()
            .then(sites => {
                sites.sort((a, b) => a.location.localeCompare(b.location));
                res.render("sites", { page: "/sites", sites: sites, filter: "All Sites" });
            })
            .catch(err => res.status(404).render("404", { message: err }));
    }
});
  


app.get("/sites/:siteId", (req, res) => {
    siteData.getSiteById(req.params.siteId)
        .then(site => {
            if (site) {
                res.render("site", { site: site });
            } else {
                res.status(404).render("404", { message: "No site found with the specified ID." });
            }
        })
        .catch(err => res.status(404).render("404", { message: err }));
});


// 404 Error Handler
app.use((req, res) => {
    res.status(404).render("404", { message: "I'm sorry, we're unable to find what you're looking for." });
});

// Initialize data and start the server
siteData.initialize()
    .then(() => {
        app.listen(HTTP_PORT, () => console.log(`Server running on port ${HTTP_PORT}`));
    })
    .catch(err => console.error(`Initialization failed: ${err}`));