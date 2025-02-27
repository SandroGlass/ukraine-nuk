// Initialize variables
let scroller;
let svg;
let nuclearFacilities = [];

// Facility data - refined positions
const facilityData = [
    { type: "nuclear-plant", name: "Rivne NPP", lat: 51.3, lon: 25.9 },
    { type: "nuclear-plant", name: "Chernobyl NPP", lat: 51.4, lon: 30.1 },
    { type: "nuclear-plant", name: "Khmelnytskyi NPP", lat: 50.3, lon: 26.6 },
    { type: "nuclear-plant", name: "South Ukrainian NPP", lat: 47.8, lon: 31.2 },
    { type: "nuclear-plant", name: "Zaporizhzhia NPP", lat: 47.5, lon: 34.6 },
    { type: "warhead-storage", name: "Nuclear Warhead Storage (Makariv)", lat: 50.5, lon: 29.8 },
    { type: "warhead-storage", name: "Nuclear Warhead Storage (Nadvirna)", lat: 48.6, lon: 24.6 },
    { type: "warhead-storage", name: "Nuclear Warhead Storage (Tsybuleve)", lat: 48.8, lon: 32.1 },
    { type: "warhead-storage", name: "Nuclear Warhead Storage (Feodosiya)", lat: 45.0, lon: 35.4 },
    { type: "strategic-missile", name: "19th Missile Division", lat: 49.5, lon: 27.0 },
    { type: "strategic-missile", name: "43rd Missile Army HQ", lat: 49.2, lon: 28.5 },
    { type: "strategic-missile", name: "46th Missile Division", lat: 48.0, lon: 30.3 },
    { type: "military", name: "184th Bomber Regiment", lat: 50.6, lon: 33.0 },
    { type: "military", name: "Antonov Aircraft Building", lat: 50.4, lon: 30.3 },
    { type: "military", name: "100th Bomber Regiment", lat: 50.2, lon: 30.0 },
    { type: "military", name: "Pivdenne Design Bureau", lat: 48.5, lon: 35.0 },
    { type: "military", name: "Black Sea Fleet HQ", lat: 44.6, lon: 33.5 },
    { type: "research", name: "Nuclear Research Institute (Kyiv)", lat: 50.5, lon: 30.5 },
    { type: "research", name: "Kharkiv Institute of Physics and Technology", lat: 50.0, lon: 36.2 },
    { type: "research", name: "Sevastopol Naval Institute", lat: 44.6, lon: 33.5 }
];

// Initialize after DOM content is loaded
document.addEventListener("DOMContentLoaded", function () {
    console.log("DOM loaded, initializing map...");

    // Create a more detailed Ukraine GeoJSON - this is a simplified version for demonstration
    const ukraineGeoJSON = {
        type: "Feature",
        properties: { name: "Ukraine" },
        geometry: {
            type: "Polygon",
            coordinates: [[
                [22.1, 49.0], [21.3, 49.8], [21.4, 50.8], [22.6, 51.2], [23.6, 51.5],
                [24.2, 51.6], [25.2, 52.1], [26.6, 51.8], [27.2, 51.6], [28.2, 51.7],
                [29.3, 52.0], [30.4, 52.1], [31.8, 52.1], [32.6, 52.2], [33.8, 52.0],
                [34.8, 51.7], [35.8, 51.3], [36.8, 50.8], [37.8, 50.3], [38.7, 49.5],
                [39.5, 49.0], [40.0, 48.3], [40.2, 47.6], [38.5, 47.0], [37.5, 46.6],
                [36.8, 46.3], [35.6, 46.0], [34.8, 45.9], [33.8, 46.1], [33.0, 46.2],
                [32.2, 46.2], [31.2, 46.3], [30.5, 46.1], [29.6, 45.6], [29.3, 45.3],
                [29.6, 45.0], [29.8, 44.8], [28.8, 44.8], [28.2, 45.5], [28.0, 45.8],
                [28.1, 46.1], [28.2, 46.6], [27.7, 48.4], [26.6, 48.3], [25.2, 47.9],
                [24.4, 47.9], [23.2, 48.1], [22.7, 48.2], [22.1, 48.4], [22.0, 48.8],
                [22.1, 49.0]
            ]]
        }
    };

    // Occupied territories (more accurate shapes)
    const occupiedTerritories = [
        {
            name: "Crimea",
            coordinates: [[
                [33.4, 45.4], [33.8, 45.2], [34.6, 45.0], [35.2, 45.1], [35.8, 45.2],
                [36.2, 45.6], [36.4, 45.8], [36.0, 46.1], [35.0, 46.0], [34.6, 45.8],
                [34.0, 45.7], [33.6, 45.6], [33.4, 45.4]
            ]]
        },
        {
            name: "Eastern Donbas",
            coordinates: [[
                [37.5, 48.0], [38.0, 48.0], [38.5, 48.2], [39.0, 48.4], [39.2, 48.6],
                [39.2, 49.0], [38.8, 49.2], [38.4, 49.2], [38.0, 49.0], [37.6, 48.5],
                [37.5, 48.0]
            ]]
        },
        {
            name: "Southern Ukraine",
            coordinates: [[
                [33.0, 46.7], [34.0, 46.8], [35.0, 46.8], [36.0, 46.7], [36.5, 46.6],
                [37.0, 46.4], [37.0, 46.0], [36.6, 45.8], [35.5, 45.8], [34.5, 46.0],
                [33.5, 46.3], [33.0, 46.7]
            ]]
        }
    ];

    // Initialize SVG and D3
    svg = d3.select("#ukraine-map-svg");

    // Set background for SVG area
    svg.append("rect")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("fill", "#e6f3ff");

    // Create a projection for Ukraine - adjusted scale and center
    const projection = d3.geoMercator()
        .center([31.5, 48.5])  // Slightly adjusted center
        .scale(3200)           // Increased scale for better visibility
        .translate([400, 300]);

    // Create a path generator
    const pathGenerator = d3.geoPath().projection(projection);

    // Draw Ukraine
    svg.append("g")
        .attr("class", "ukraine")
        .append("path")
        .datum(ukraineGeoJSON)
        .attr("d", pathGenerator)
        .attr("fill", "#f5f5f5")
        .attr("stroke", "#333")
        .attr("stroke-width", 1.5);

    // Draw occupied territories (initially hidden)
    const occupiedGroup = svg.append("g")
        .attr("class", "occupied-territories");

    occupiedTerritories.forEach(territory => {
        occupiedGroup.append("path")
            .datum({
                type: "Feature",
                properties: { name: territory.name },
                geometry: {
                    type: "Polygon",
                    coordinates: territory.coordinates
                }
            })
            .attr("d", pathGenerator)
            .attr("class", `occupied-territory ${territory.name.toLowerCase().replace(/\s+/g, '-')}`)
            .attr("fill", "rgba(255, 0, 0, 0.3)")
            .attr("stroke", "rgba(255, 0, 0, 0.7)")
            .attr("stroke-width", 1)
            .style("opacity", 0);
    });

    // Add nuclear facilities
    const facilitiesGroup = svg.append("g")
        .attr("class", "nuclear-facilities");

    facilityData.forEach(facility => {
        const [x, y] = projection([facility.lon, facility.lat]);

        // Create group for each facility
        const facilityGroup = facilitiesGroup.append("g")
            .attr("class", `nuclear-facility ${facility.type}`)
            .attr("transform", `translate(${x}, ${y})`)
            .style("opacity", 1);

        // Add appropriate icon based on facility type
        if (facility.type === "nuclear-plant") {
            // Nuclear power plant (orange circle)
            facilityGroup.append("circle")
                .attr("r", 8)
                .attr("fill", "rgba(255, 165, 0, 0.9)")
                .attr("stroke", "#000")
                .attr("stroke-width", 1);
        } else if (facility.type === "warhead-storage") {
            // Warhead storage (purple square)
            facilityGroup.append("rect")
                .attr("x", -6)
                .attr("y", -6)
                .attr("width", 12)
                .attr("height", 12)
                .attr("fill", "rgba(128, 0, 128, 0.9)")
                .attr("stroke", "#000")
                .attr("stroke-width", 1);
        } else if (facility.type === "strategic-missile") {
            // Strategic missile (black diamond)
            facilityGroup.append("path")
                .attr("d", "M0,-8 L6,0 L0,8 L-6,0 Z")
                .attr("fill", "rgba(0, 0, 0, 0.9)")
                .attr("stroke", "#000")
                .attr("stroke-width", 1);
        } else if (facility.type === "military") {
            // Military facility (blue square)
            facilityGroup.append("rect")
                .attr("x", -6)
                .attr("y", -6)
                .attr("width", 12)
                .attr("height", 12)
                .attr("fill", "rgba(0, 0, 255, 0.9)")
                .attr("stroke", "#000")
                .attr("stroke-width", 1);
        } else if (facility.type === "research") {
            // Research facility (green circle)
            facilityGroup.append("circle")
                .attr("r", 7)
                .attr("fill", "rgba(0, 128, 0, 0.9)")
                .attr("stroke", "#000")
                .attr("stroke-width", 1);
        }

        // Add tooltip
        const tooltip = facilityGroup.append("text")
            .attr("class", "tooltip")
            .attr("x", 10)
            .attr("y", 4)
            .text(facility.name)
            .style("opacity", 0)
            .style("font-size", "12px")
            .style("pointer-events", "none");

        // Hover effects
        facilityGroup
            .on("mouseover", function () {
                tooltip.style("opacity", 1);
                d3.select(this).select("circle, rect, path").style("stroke-width", 2);
            })
            .on("mouseout", function () {
                tooltip.style("opacity", 0);
                d3.select(this).select("circle, rect, path").style("stroke-width", 1);
            });

        nuclearFacilities.push(facilityGroup);
    });

    // Add major cities with better positioning
    const majorCities = [
        { name: "Kyiv", lat: 50.45, lon: 30.52 },
        { name: "Lviv", lat: 49.84, lon: 24.03 },
        { name: "Kharkiv", lat: 50.00, lon: 36.23 },
        { name: "Dnipro", lat: 48.47, lon: 34.99 },
        { name: "Odesa", lat: 46.48, lon: 30.72 },
        { name: "Donetsk", lat: 48.00, lon: 37.80 },
        { name: "Sevastopol", lat: 44.62, lon: 33.53 }
    ];

    // Add city dots
    svg.append("g")
        .attr("class", "city-dots")
        .selectAll("circle")
        .data(majorCities)
        .enter()
        .append("circle")
        .attr("cx", d => projection([d.lon, d.lat])[0])
        .attr("cy", d => projection([d.lon, d.lat])[1])
        .attr("r", 3)
        .attr("fill", "#333");

    // Add city labels with better positioning
    svg.append("g")
        .attr("class", "city-labels")
        .selectAll("text")
        .data(majorCities)
        .enter()
        .append("text")
        .attr("x", d => projection([d.lon, d.lat])[0])
        .attr("y", d => projection([d.lon, d.lat])[1] - 10)
        .attr("text-anchor", "middle")
        .attr("class", "city-label")
        .text(d => d.name)
        .attr("fill", "#333")
        .attr("font-size", "14px")
        .attr("font-weight", "bold");

    // Add legend
    createLegend();

    // Initialize scrollama
    scroller = scrollama();

    // Setup scrollama
    scroller
        .setup({
            step: ".step",
            offset: 0.5,
            debug: false
        })
        .onStepEnter(handleStepEnter)
        .onStepExit(handleStepExit);

    // Handle window resize
    window.addEventListener("resize", handleResize);

    console.log("Map initialization complete");
});

// Create legend
function createLegend() {
    const legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", "translate(50, 50)");

    // Add background for legend
    legend.append("rect")
        .attr("x", -10)
        .attr("y", -20)
        .attr("width", 220)
        .attr("height", 170)
        .attr("fill", "rgba(255, 255, 255, 0.9)")
        .attr("stroke", "#333")
        .attr("stroke-width", 1)
        .attr("rx", 5);

    // Add legend title
    legend.append("text")
        .attr("x", 0)
        .attr("y", -5)
        .attr("font-weight", "bold")
        .attr("font-size", "14px")
        .text("Legend");

    const legendItems = [
        { type: "nuclear-plant", label: "Nuclear Power Plant", symbol: "circle", color: "rgba(255, 165, 0, 0.9)" },
        { type: "warhead-storage", label: "Warhead Storage", symbol: "rect", color: "rgba(128, 0, 128, 0.9)" },
        { type: "strategic-missile", label: "Missile Division", symbol: "diamond", color: "rgba(0, 0, 0, 0.9)" },
        { type: "military", label: "Military Facility", symbol: "rect", color: "rgba(0, 0, 255, 0.9)" },
        { type: "research", label: "Research Institute", symbol: "circle", color: "rgba(0, 128, 0, 0.9)" },
        { type: "occupied", label: "Occupied Territory", symbol: "rect", color: "rgba(255, 0, 0, 0.3)" }
    ];

    // Add legend items
    legendItems.forEach((item, i) => {
        const g = legend.append("g")
            .attr("transform", `translate(0, ${i * 25 + 10})`);

        if (item.symbol === "circle") {
            g.append("circle")
                .attr("r", 6)
                .attr("fill", item.color)
                .attr("stroke", "#000")
                .attr("stroke-width", 1);
        } else if (item.symbol === "rect") {
            g.append("rect")
                .attr("x", -6)
                .attr("y", -6)
                .attr("width", 12)
                .attr("height", 12)
                .attr("fill", item.color)
                .attr("stroke", item.type === "occupied" ? "rgba(255, 0, 0, 0.7)" : "#000")
                .attr("stroke-width", 1);
        } else if (item.symbol === "diamond") {
            g.append("path")
                .attr("d", "M0,-6 L6,0 L0,6 L-6,0 Z")
                .attr("fill", item.color)
                .attr("stroke", "#000")
                .attr("stroke-width", 1);
        }

        g.append("text")
            .attr("x", 15)
            .attr("y", 4)
            .text(item.label)
            .attr("font-size", "14px");
    });
}

// Handle window resize
function handleResize() {
    console.log("Window resized");
    scroller.resize();
}

// Handle step enter
function handleStepEnter(response) {
    const step = parseInt(response.element.dataset.step);
    console.log(`Entering step ${step}`);

    // Update UI based on current step
    switch (step) {
        case 1:
            // Show all nuclear facilities
            showAllFacilities();
            hideOccupiedTerritories();
            break;
        case 2:
            // Budapest Memorandum - no change in facilities yet
            showAllFacilities();
            hideOccupiedTerritories();
            break;
        case 3:
            // Strategic nuclear disarmament
            hideFacilitiesByType(["strategic-missile", "military"]);
            hideOccupiedTerritories();
            break;
        case 4:
            // Nuclear warhead storage
            hideFacilitiesByType(["warhead-storage"]);
            hideOccupiedTerritories();
            break;
        case 5:
            // Keep civilian nuclear power
            showOnlyFacilitiesByType(["nuclear-plant", "research"]);
            hideOccupiedTerritories();
            break;
        case 6:
            // 2014 Crimea annexation
            console.log("Step 6: Showing Crimea");
            showOnlyFacilitiesByType(["nuclear-plant", "research"]);
            showOccupiedTerritory("crimea");
            break;
        case 7:
            // 2022 full-scale invasion
            console.log("Step 7: Showing all occupied territories");
            showOnlyFacilitiesByType(["nuclear-plant", "research"]);
            showAllOccupiedTerritories();
            break;
        case 8:
            // Legacy of disarmament
            showOnlyFacilitiesByType(["nuclear-plant", "research"]);
            showAllOccupiedTerritories();
            break;
        default:
            console.log("Unknown step:", step);
    }
}

// Handle step exit
function handleStepExit(response) {
    // Optional: Add any specific exit animations here
}

// Show all nuclear facilities
function showAllFacilities() {
    nuclearFacilities.forEach(facility => {
        facility.transition().duration(500)
            .style("opacity", 1);
    });
}

// Hide facilities by type
function hideFacilitiesByType(types) {
    nuclearFacilities.forEach(facility => {
        const facilityType = facility.attr("class").split(" ")[1];
        if (types.includes(facilityType)) {
            facility.transition().duration(500)
                .style("opacity", 0);
        }
    });
}

// Show only facilities of certain types
function showOnlyFacilitiesByType(types) {
    nuclearFacilities.forEach(facility => {
        const facilityType = facility.attr("class").split(" ")[1];
        if (types.includes(facilityType)) {
            facility.transition().duration(500)
                .style("opacity", 1);
        } else {
            facility.transition().duration(500)
                .style("opacity", 0);
        }
    });
}

// Show specific occupied territory
function showOccupiedTerritory(territoryName) {
    console.log("Showing territory:", territoryName);
    d3.selectAll(".occupied-territory")
        .transition().duration(500)
        .style("opacity", function () {
            const className = d3.select(this).attr("class");
            return className.includes(territoryName) ? 0.8 : 0;
        });
}

// Show all occupied territories
function showAllOccupiedTerritories() {
    d3.selectAll(".occupied-territory")
        .transition().duration(500)
        .style("opacity", 0.8);
}

// Hide all occupied territories
function hideOccupiedTerritories() {
    d3.selectAll(".occupied-territory")
        .transition().duration(500)
        .style("opacity", 0);
}