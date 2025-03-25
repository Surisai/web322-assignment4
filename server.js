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



const express = require("express");
const path = require("path");
const app = express();
const siteData = require("./modules/data-service");


const HTTP_PORT = process.env.PORT || 8080;

// Set EJS as the view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "images")));
app.use(express.urlencoded({ extended: true })); // Required for form submissions

// Home Page (Display First 3 Sites)
app.get("/", (req, res) => {
    res.send("Assignment 5: Preeya Surisai - 180121238");
});

app.get("/home", (req, res) => {
    siteData.getAllSites()
        .then(sites => res.render("home", { page: "/", sites: sites.slice(0, 3) }))
        .catch(err => res.status(500).render("500", { message: "Failed to load site data." }));
});

// ℹAbout Page
app.get("/about", (req, res) => {
    res.render("about", { page: "/about" });
});

// Display All Sites with Optional Filtering (Region / Province)
// app.get("/sites", (req, res) => {
//     if (req.query.region) {
//         siteData.getSitesByRegion(req.query.region)
//             .then(sites => res.render("sites", { page: "/sites", sites, filter: req.query.region }))
//             .catch(err => res.status(404).render("404", { message: "No sites found for the specified region." }));
//     } else if (req.query.provinceOrTerritory) {
//         siteData.getSitesByProvinceOrTerritoryName(req.query.provinceOrTerritory)
//             .then(sites => res.render("sites", { page: "/sites", sites, filter: req.query.provinceOrTerritory }))
//             .catch(err => res.status(404).render("404", { message: "No sites found for the specified province or territory." }));
//     } else {
//         siteData.getAllSites()
//             .then(sites => res.render("sites", { page: "/sites", sites, filter: "All Sites" }))
//             .catch(err => res.status(404).render("404", { message: err }));
//     }
// });
app.get("/sites", (req, res) => {
    if (req.query.region) {
        siteData.getSitesByRegion(req.query.region)
            .then(sites => {
                siteData.getSiteCount()
                    .then(count => res.render("sites", { page: "/sites", sites, filter: req.query.region, siteCount: count }))
                    .catch(err => res.status(500).render("500", { message: "Failed to load site count." }));
            })
            .catch(err => res.status(404).render("404", { message: "No sites found for the specified region." }));
    } else if (req.query.provinceOrTerritory) {
        siteData.getSitesByProvinceOrTerritoryName(req.query.provinceOrTerritory)
            .then(sites => {
                siteData.getSiteCount()
                    .then(count => res.render("sites", { page: "/sites", sites, filter: req.query.provinceOrTerritory, siteCount: count }))
                    .catch(err => res.status(500).render("500", { message: "Failed to load site count." }));
            })
            .catch(err => res.status(404).render("404", { message: "No sites found for the specified province or territory." }));
    } else {
        siteData.getAllSites()
            .then(sites => {
                siteData.getSiteCount()
                    .then(count => res.render("sites", { page: "/sites", sites, filter: "All Sites", siteCount: count }))
                    .catch(err => res.status(500).render("500", { message: "Failed to load site count." }));
            })
            .catch(err => res.status(404).render("404", { message: err }));
    }
});

// View a Single Site
app.get("/sites/:siteId", (req, res) => {
    siteData.getSiteById(req.params.siteId)
        .then(site => site ? res.render("site", { site }) : res.status(404).render("404", { message: "No site found with the specified ID." }))
        .catch(err => res.status(404).render("404", { message: err }));
});

// Add Site Page (Form)
app.get("/addSite", (req, res) => {
    siteData.getAllProvincesAndTerritories()
        .then(provincesAndTerritories => res.render("addSite", { provincesAndTerritories }))
        .catch(err => res.status(500).render("500", { message: err }));
});

// Add Site (Handle Form Submission)
app.post("/addSite", (req, res) => {
    siteData.addSite(req.body)
        .then(() => res.redirect("/sites"))
        .catch(err => res.status(500).render("500", { message: err }));
});

//  Edit Site Page
app.get("/editSite/:id", (req, res) => {
    Promise.all([siteData.getSiteById(req.params.id), siteData.getAllProvincesAndTerritories()])
        .then(([site, provincesAndTerritories]) => res.render("editSite", { site, provincesAndTerritories }))
        .catch(err => res.status(404).render("404", { message: err }));
});

//  Edit Site (Handle Form Submission)
app.post("/editSite", (req, res) => {
    siteData.editSite(req.body.siteId, req.body)
        .then(() => res.redirect("/sites"))
        .catch(err => res.status(500).render("500", { message: err }));
});

// Delete Site
app.post("/deleteSite", (req, res) => {
    siteData.deleteSite(req.body.siteId)
        .then(() => res.redirect("/sites"))
        .catch(err => res.status(500).render("500", { message: err }));
});

// 500 Error Handler
app.use((err, req, res, next) => {
    console.error("Server Error:", err.stack);
    res.status(500).render("500", { message: "Something went wrong. Please try again later." });
});

// 404 Error Handler
app.use((req, res) => {
    res.status(404).render("404", { message: "I'm sorry, we're unable to find what you're looking for." });
});

//  Initialize database and start the server
siteData.initialize()
    .then(() => {
        app.listen(HTTP_PORT, () => console.log(`Server running on port ${HTTP_PORT}`));
    })
    .catch(err => console.error(`Initialization failed: ${err}`));
