
// ================
// Variables
// ================

// Map svg geometry
const w_map = 600;
const h_map = 600;
let margin_map = {left: 400, right: 100, top: 100, bottom: 10};

// Controller svg geometry
const w_add_inf = 700;
const h_add_inf = 600;
let margin_add_inf = {left: 50, right: 50, top: 100, bottom: 10};

// Data
let dataset = [];

// Create map svg
let map_svg = d3.select("body")
    .attr("class", "map_svg")
    .append("svg")
    .style("position", "absolute")
    .style("top", "100")
    .style("width", margin_map.left + w_map + margin_map.right)
    .style("height", margin_map.top + h_map + margin_map.bottom);

// Create tooltip map information div
let mouseover_map_info_div = d3.select("body")
    .append("div")
    .attr("class", "map_tooltip");

// Create additionnal information div
let additional_info_div = d3.select("body")
    .attr("class", "additional_info_div")
    .append("div")
    .style("position", "absolute")
    .style("top", "100")
    .style("left", margin_map.left + w_map + margin_map.right)
    .style("width", margin_add_inf.left + w_add_inf + margin_add_inf.right)
    .style("height", margin_add_inf.top + h_add_inf + margin_add_inf.bottom);


// ================
// Functions
// ================

// ----------------
// Map
// Constructor
// ----------------

function map_constructor(data) {

    // --- Scales ------------------

    color_domain_density = [0, 100, 500, 2500, 10000];
    color_range_density = ["#29c931", "#f6cd43", "#fd7e16", "#ff2714", "#9900ff"];

    c_scale = d3.scaleThreshold()
        .domain(color_domain_density.slice(1, color_domain_density.length))
        .range(color_range_density);

    radius_domain_population = [0, 5000, 25000, 100000, 500000];
    radius_range_population = [1, 4, 8, 16, 32];
    
    r_scale = d3.scaleThreshold()
        .domain(radius_domain_population.slice(1, radius_domain_population.length))
        .range(radius_range_population);

    x_scale = d3.scaleLinear()
          .domain(d3.extent(data, d => d.longitude))
          .range([margin_map.left, w_map + margin_map.left]);

    y_scale = d3.scaleLinear()
        .domain(d3.extent(data, d => d.latitude))
        .range([h_map + margin_map.top, margin_map.top]);

    // --- Points ------------------

    map_svg.selectAll("circle")
           .data(data)
           .enter()
           .append("circle")
           .attr("class", "data_point")
           .attr("opacity", "0.5")
           .style("opacity", "0.5")
           .attr("fill", d => c_scale(d.density))
           .attr("r", d => r_scale(d.population))
           .attr("cx", d => x_scale(d.longitude))
           .attr("cy", d => y_scale(d.latitude))
           .on("mouseover", function(d) {
               if (d3.select(this).style("opacity") != "0.03") {
                    mouseover_map_info_div.transition()
                        .duration(100)
                        .style("opacity", "1");
                    mouseover_map_info_div.html(
                        "<strong>City : </strong>" + d.place + 
                        "<br><strong>Population : </strong>" + d3.format(",d")(d.population) + " hab." +
                        "<br><strong>Density : </strong>" + d3.format(",d")(d.density) + " hab./km<sup>2</sup>"
                        )
                        .style("left", d3.event.pageX + 15)
                        .style("top", d3.event.pageY - 10);
               };
           })
           .on("mouseout", function() {
                mouseover_map_info_div.transition()
                    .duration(100)
                    .style("opacity", "0");
           });

    // --- x-axis ------------------

    map_svg.append("g")
        .attr("class", "x_axis_map")
        .attr("transform", "translate(0," + margin_map.top/2 + ")")
        .call(d3.axisBottom(x_scale).ticks(5));

    map_svg.append("text")
        .attr("class", "x_title_map")
        .attr("text-anchor", "end")
        .attr("x", margin_map.left + w_map)
        .attr("y", margin_map.top/2 - 10)
        .text("Longitude");

    // --- y-axis ------------------

    map_svg.append("g") 
        .attr("class", "y_axis_map")
        .attr("label", "Latitude")
        .attr("transform", "translate(" + 7*margin_map.left/8 + ",0)")
        .call(d3.axisRight(y_scale).ticks(5));

    map_svg.append("text")  
        .attr("class", "y_title_map")
        .attr("text-anchor", "start")
        .attr("transform", "rotate(-90)")
        .attr("x", - (margin_map.top + h_map))
        .attr("y", 7*margin_map.left/8 - 10)
        .text("Latitude");
        
    // --- Info on interaction -----

    map_svg.append("text")
        .attr("class", "info_map")
        .text("Click on legend to filter data.")
        .style("white-space", "pre-wrap")
        .style("font-size", 13)
        .attr("text-anchor", "start")
        .attr("x", 50)
        .attr("y", margin_map.top);
    
    // --- Density legend ----------
    
    map_svg.append("text")
        .attr("class", "legend_subtitle")
        .text("Density :")
        .attr("text-anchor", "start")
        .attr("x", 50)
        .attr("y", margin_map.top + 80);

    color_range_density.forEach( (element, i) => {
        
        // --- Density legend figure ---

        map_svg.append("rect")
            .attr("class", "density_legend")
            .style("cursor", "pointer")
            .attr("fill", element)
            .style("width", "25")
            .style("height", "10")
            .attr("x", 50)
            .attr("y", margin_map.top + 70 + (i+1)*30)
            .on("click", function() {

                // --- Reset depart. select ----

                department_selector.property('value', '-');
                department_selector.property('text', '-');
                document.querySelector("select").dispatchEvent(new Event('change'));

                // --- Apply density filter ----

                if (i != color_range_density.length-1) {
                    map_svg.selectAll(".data_point")
                        .style("opacity", d => (d.density >= color_domain_density[i] && d.density < color_domain_density[i+1]) ? "0.7" : "0.03");
                } else {
                    map_svg.selectAll(".data_point")
                        .style("opacity", d => (d.density >= color_domain_density[i]) ? "0.7" : "0.03");
                };
                
            });

        // --- Density legend text -----

        if (i != color_range_density.length-1) {

            map_svg.append("text")
                .text(d3.format(",d")(color_domain_density[i]) + " - " + d3.format(",d")(color_domain_density[i+1]) + " hab/km2")
                .attr("class", "density_legend_text")
                .style("cursor", "pointer")
                .style("font-size", "13")
                .attr("text-anchor", "start")
                .attr("x", 85)
                .attr("y", margin_map.top + 80 + (i+1)*30)
                .on("click", function() {

                    // --- Reset depart. select ----

                    department_selector.property('value', '-');
                    department_selector.property('text', '-');
                    document.querySelector("select").dispatchEvent(new Event('change'));

                    // --- Apply density filter ----

                    map_svg.selectAll(".data_point")
                        .style("opacity", d => (d.density >= color_domain_density[i] && d.density < color_domain_density[i+1]) ? "0.7" : "0.03");

                });

        } else {

            map_svg.append("text")
                .text("More than " + d3.format(",d")(color_domain_density[i]) + " hab/km2")
                .attr("class", "density_legend_text")
                .style("cursor", "pointer")
                .style("font-size", "13")
                .attr("text-anchor", "start")
                .attr("x", 85)
                .attr("y", margin_map.top + 80 + (i+1)*30)
                .on("click", function() {

                    // --- Reset depart. select ----

                    department_selector.property('value', '-');
                    department_selector.property('text', '-');
                    document.querySelector("select").dispatchEvent(new Event('change'));

                    // --- Apply density filter ----

                    map_svg.selectAll(".data_point")
                        .style("opacity", d => (d.density >= color_domain_density[i]) ? "0.7" : "0.03");

                });

        };

    });

    // --- Population legend -------

    map_svg.append("text")
        .text("Population :")
        .attr("class", "legend_subtitle")
        .attr("text-anchor", "start")
        .attr("x", 50)
        .attr("y", margin_map.top + 310);

    radius_range_population.forEach( (element, i) => {
        
        // --- Population legend fig. --

        map_svg.append("ellipse")
            .attr("class", "population_legend")
            .style("cursor", "pointer")
            .attr("fill", "#413e3e")
            .attr("rx", element)
            .attr("ry", element)
            .attr("cx", 85 - radius_range_population[radius_range_population.length-1])
            .attr("cy", margin_map.top + 300 + (i+1)*35  + element*1.5)
            .on("click", function() {

                // --- Reset depart. select ----

                department_selector.property('value', '-');
                department_selector.property('text', '-');
                document.querySelector("select").dispatchEvent(new Event('change'));

                // --- Apply popul. filter -----

                if (i != radius_range_population.length-1) {
                    map_svg.selectAll(".data_point")
                        .style("opacity", d => (d.population >= radius_domain_population[i] && d.population < radius_domain_population[i+1]) ? "0.7" : "0.03");
                } else {
                    map_svg.selectAll(".data_point")
                        .style("opacity", d => (d.population >= radius_domain_population[i]) ? "0.7" : "0.03");
                };

            });
            
        // --- Population legend text --

        if (i != radius_range_population.length-1) {

            map_svg.append("text")
                .text(d3.format(",d")(radius_domain_population[i]) + " - " + d3.format(",d")(radius_domain_population[i+1]) + " hab.")
                .attr("class", "population_legend_text")
                .style("cursor", "pointer")
                .style("font-size", "13")
                .attr("text-anchor", "start")
                .attr("x", 85 + element/2)
                .attr("y", margin_map.top + 305 + (i+1)*35 + element*1.5)
                .on("click", function() {

                    // --- Reset depart. select ----

                    department_selector.property('value', '-');
                    department_selector.property('text', '-');
                    document.querySelector("select").dispatchEvent(new Event('change'));

                    // --- Apply popul. filter -----

                    map_svg.selectAll(".data_point")
                        .style("opacity", d => (d.population >= radius_domain_population[i] && d.population < radius_domain_population[i+1]) ? "0.7" : "0.03");
                
                });

        } else {

            map_svg.append("text")
                .text("More than " + d3.format(",d")(radius_domain_population[i]) + " hab.")
                .attr("class", "population_legend_text")
                .style("cursor", "pointer")
                .style("font-size", "13")
                .attr("text-anchor", "start")
                .attr("x", 85 + element/2)
                .attr("y", margin_map.top + 305 + (i+1)*35 + element*1.5)
                .on("click", function() {

                    // --- Reset depart. select ----

                    department_selector.property('value', '-');
                    department_selector.property('text', '-');
                    document.querySelector("select").dispatchEvent(new Event('change'));

                    // --- Apply popul. filter -----

                    map_svg.selectAll(".data_point")
                        .style("opacity", d => (d.population >= radius_domain_population[i]) ? "0.7" : "0.03");

                });

        };

    });

};

// ----------------
// Controler
// Constructor
// ----------------

function additional_info_constructor(data) {

    // --- Generate data -----------

    department_code_data = data.map(d => 
        (d.codePostal.toString().length === 5) ? 
        d.codePostal.toString().substring(0,2) : 
        d.codePostal.toString().substring(0,1)
    );
    department_code_data = Array.from(new Set(department_code_data)).sort(d3.ascending);
    department_code_data = ["All", "-"].concat(department_code_data);

    department_code_data.forEach( (element, i) => {

        if (element === "All") {

            department_code_data[i] = {
                "dept_code": element,
                "average_density": d3.mean(data, d => d.density),
                "average_population": d3.mean(data, d => d.population),
            };

        } else if (element === "-") {

            department_code_data[i] = {
                "dept_code": element,
                "average_density": 0,
                "average_population": 0,
            };

        } else {
            
            department_code_data[i] = {
                "dept_code": element,
                "average_density": d3.mean(
                    data.filter(d => (
                        d.codePostal.toString().startsWith(element) && 
                        d.codePostal.toString().length === (+element*1000).toString().length
                        )),
                    d => d.density
                ),
                "average_population": d3.mean(
                    data.filter(d => (
                        d.codePostal.toString().startsWith(element) && 
                        d.codePostal.toString().length === (+element*1000).toString().length
                        )),
                    d => d.population
                )
            };

        };

    });

    // --- Select box --------------

    additional_info_div.append("text")
        .text("Select department code :")
        .attr("class", "department_selector_label")
        .style("position", "relative")
        .style("left", margin_add_inf.left)
        .style("top", margin_add_inf.top);

    department_selector = additional_info_div.append("select")
        .attr("class", "department_selector")
        .style("position", "relative")
        .style("left", margin_add_inf.left + 10)
        .style("top", margin_add_inf.top)
        .on("change", function() {

            opt = department_selector.property('value');

            if (opt != "-" && opt != "All") {

                // --- Recover data ------------

                data_filtered = data.filter(d => (
                    d.codePostal.toString().startsWith(opt.toString()) && 
                    d.codePostal.toString().length === (opt*1000).toString().length
                ));

                // --- Select map department ---

                map_svg.selectAll(".data_point")
                    .style("opacity", d => (data_filtered.includes(d)) ? "0.7" : "0.03");

                // --- Reset density object----

                density_class_object_array = [
                    ".stat_density_axis", ".stat_density_title", ".stat_density_figure",
                    ".stat_density_figure_dept", ".stat_density_text", ".stat_density_text_dept"
                ];

                density_class_object_array.forEach( function(element) {
                    density_svg.selectAll(element)
                        .remove();
                });

                // --- Reset population object 
                
                population_class_object_array = [
                    ".stat_population_axis", ".stat_population_title", ".stat_population_figure", 
                    ".stat_population_figure_dept", ".stat_population_text", ".stat_population_text_dept"
                ];

                population_class_object_array.forEach( function(element) {
                    population_svg.selectAll(element)
                        .remove();
                });
                
                // --- Density axis ------------

                density_svg.append("line")
                    .attr("class", "stat_density_axis")
                    .attr("x1", "50")
                    .attr("y1", "25")
                    .attr("x2", "50")
                    .attr("y2", "150")
                    .attr("stroke", "black");

                // --- Density title ----------- 

                density_svg.append("text")
                    .attr("class", "stat_density_title")
                    .attr("text-anchor", "middle")
                    .attr("transform", "rotate(-90)")
                    .attr("x", "-87")
                    .attr("y", "40")
                    .text("Density");

                // --- Density figure ----------

                density_svg.append("rect")
                    .data(department_code_data.filter(d => d.dept_code === "All"))
                    .attr("class", "stat_density_figure")
                    .attr("fill", "#00ce71")
                    .style("width", d => density_width_scale(d.average_density))
                    .style("height", "30")
                    .attr("x", "50")
                    .attr("y", "50");

                density_svg.append("rect")
                    .data(department_code_data.filter(d => d.dept_code === opt))
                    .attr("class", "stat_density_figure_dept")
                    .attr("fill", "#f6cd43")
                    .style("width", d => density_width_scale(d.average_density))
                    .style("height", "30")
                    .attr("x", "50")
                    .attr("y", "95");

                // --- Density  text -----------

                density_svg.append("text")
                    .data(department_code_data.filter(d => d.dept_code === "All"))
                    .attr("class", "stat_density_text")
                    .attr("text-anchor", "start")
                    .style("white-space", "pre-wrap")
                    .attr("x", "60")
                    .attr("y", "40")
                    .text(d => "National average : " + d3.format(",d")(d.average_density) + " hab./km2"); 

                density_svg.append("text")
                    .data(department_code_data.filter(d => d.dept_code === opt))
                    .attr("class", "stat_density_text_dept")
                    .attr("text-anchor", "start")
                    .style("white-space", "pre-wrap")
                    .attr("x", "60")
                    .attr("y", "145")
                    .text(d => "Department average : " + d3.format(",d")(d.average_density) + " hab/km2");  
                    
                // --- Population axis ---------

                population_svg.append("line")
                    .attr("class", "stat_population_axis")
                    .attr("x1", "50")
                    .attr("y1", "25")
                    .attr("x2", "50")
                    .attr("y2", "150")
                    .attr("stroke", "black");

                // --- Population title --------

                population_svg.append("text")
                    .attr("class", "stat_population_title")
                    .attr("text-anchor", "middle")
                    .attr("transform", "rotate(-90)")
                    .attr("x", "-87")
                    .attr("y", "40")
                    .text("Population");

                // --- Population figure -------

                population_svg.append("rect")
                    .data(department_code_data.filter(d => d.dept_code === "All"))
                    .attr("class", "stat_population_figure")
                    .attr("fill", "#0085c2")
                    .style("width", d => population_width_scale(d.average_population))
                    .style("height", "30")
                    .attr("x", "50")
                    .attr("y", "50");

                population_svg.append("rect")
                    .data(department_code_data.filter(d => d.dept_code === opt))
                    .attr("class", "stat_population_figure_dept")
                    .attr("fill", "#ff8534")
                    .style("width", d => population_width_scale(d.average_population))
                    .style("height", "30")
                    .attr("x", "50")
                    .attr("y", "95");

                // --- Population  text --------

                population_svg.append("text")
                    .data(department_code_data.filter(d => d.dept_code === "All"))
                    .attr("class", "stat_population_text")
                    .attr("text-anchor", "start")
                    .style("white-space", "pre-wrap")
                    .attr("x", "60")
                    .attr("y", "40")
                    .text(d => "National average : " + d3.format(",d")(d.average_population) + " hab.");

                population_svg.append("text")
                    .data(department_code_data.filter(d => d.dept_code === opt))
                    .attr("class", "stat_population_text_dept")
                    .attr("text-anchor", "start")
                    .style("white-space", "pre-wrap")
                    .attr("x", "60")
                    .attr("y", "145")
                    .text(d => "Department average : " + d3.format(",d")(d.average_population) + " hab");  

            } else if (opt === "All") {

                // --- Reset map selection -----

                map_svg.selectAll(".data_point")
                    .style("opacity", d => "0.5");

                // --- Reset density object----

                density_class_object_array = [
                    ".stat_density_axis", ".stat_density_title", ".stat_density_figure",
                    ".stat_density_figure_dept", ".stat_density_text", ".stat_density_text_dept"
                ];

                density_class_object_array.forEach( function(element) {
                    density_svg.selectAll(element)
                        .remove();
                });

                // --- Reset population object-
                
                population_class_object_array = [
                    ".stat_population_axis", ".stat_population_title", ".stat_population_figure", 
                    ".stat_population_figure_dept", ".stat_population_text", ".stat_population_text_dept"
                ];

                population_class_object_array.forEach( function(element) {
                    population_svg.selectAll(element)
                        .remove();
                });

                // --- Density axis ------------

                density_svg.append("line")
                    .attr("class", "stat_density_axis")
                    .attr("x1", "50")
                    .attr("y1", "25")
                    .attr("x2", "50")
                    .attr("y2", "105")
                    .attr("stroke", "black");

                // --- Density title -----------

                density_svg.append("text")
                    .attr("class", "stat_density_title")
                    .attr("text-anchor", "middle")
                    .attr("transform", "rotate(-90)")
                    .attr("x", "-65")
                    .attr("y", "40")
                    .text("Density");

                // --- Density figure ----------

                density_svg.append("rect")
                    .data(department_code_data.filter(d => d.dept_code === "All"))
                    .attr("class", "stat_density_figure")
                    .attr("fill", "#00ce71")
                    .style("width", d => density_width_scale(d.average_density))
                    .style("height", "30")
                    .attr("x", "50")
                    .attr("y", "50");

                // --- Density  text -----------

                density_svg.append("text")
                    .data(department_code_data.filter(d => d.dept_code === "All"))
                    .attr("class", "stat_density_text")
                    .attr("text-anchor", "start")
                    .style("white-space", "pre-wrap")
                    .attr("x", "60")
                    .attr("y", "40")
                    .text(d => "National average : " + d3.format(",d")(d.average_density) + " hab./km2");

                // --- Population axis ---------

                population_svg.append("line")
                    .attr("class", "stat_population_axis")
                    .attr("x1", "50")
                    .attr("y1", "25")
                    .attr("x2", "50")
                    .attr("y2", "105")
                    .attr("stroke", "black");

                // --- Population title --------

                population_svg.append("text")
                    .attr("class", "stat_population_title")
                    .attr("text-anchor", "middle")
                    .attr("transform", "rotate(-90)")
                    .attr("x", "-65")
                    .attr("y", "40")
                    .text("Population");

                // --- Population figure -------

                population_svg.append("rect")
                    .data(department_code_data.filter(d => d.dept_code === "All"))
                    .attr("class", "stat_population_figure")
                    .attr("fill", "#0085c2")
                    .style("width", d => population_width_scale(d.average_population))
                    .style("height", "30")
                    .attr("x", "50")
                    .attr("y", "50");

                // --- Population text ---------

                population_svg.append("text")
                    .data(department_code_data.filter(d => d.dept_code === "All"))
                    .attr("class", "stat_population_text")
                    .attr("text-anchor", "start")
                    .style("white-space", "pre-wrap")
                    .attr("x", "60")
                    .attr("y", "40")
                    .text(d => "National average : " + d3.format(",d")(d.average_population) + " hab.");

            } else if (opt === "-") {

                // --- Reset density object----

                density_class_object_array = [
                    ".stat_density_axis", ".stat_density_title", ".stat_density_figure",
                    ".stat_density_figure_dept", ".stat_density_text", ".stat_density_text_dept"
                ];

                density_class_object_array.forEach( function(element) {
                    density_svg.selectAll(element)
                        .remove();
                });

                // --- Reset population object-
                
                population_class_object_array = [
                    ".stat_population_axis", ".stat_population_title", ".stat_population_figure", 
                    ".stat_population_figure_dept", ".stat_population_text", ".stat_population_text_dept"
                ];

                population_class_object_array.forEach( function(element) {
                    population_svg.selectAll(element)
                        .remove();
                });

            };

        });

    department_selector.selectAll("option")
        .attr("class", "department_selector_option")
        .data(department_code_data)
        .enter()
        .append("option")
        .text(d => d.dept_code)
        .attr("value", d => d.dept_code);

    document.querySelector("[value='-']").disabled = true

    // --- Density svg -------------
    
    let density_svg = additional_info_div.append("svg")
        .attr("class", "density_svg")
        .style("position", "relative")
        .style("width", w_add_inf)
        .style("height", 200)
        .style("left", 0)
        .style("top", margin_add_inf.top + 50);

    // --- Density scale -----------

    density_width_scale = d3.scaleLog()
        .domain([1, d3.max(department_code_data, d => d.average_density)])
        .range([50, w_add_inf - 50]);

    // --- Density title ----------- 

    density_svg.append("text")
        .attr("class", "stat_density_title")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("x", "-65")
        .attr("y", "40")
        .text("Density");

    // --- Density axis ------------ 
    
    density_svg.append("line")
        .attr("class", "stat_density_axis")
        .attr("x1", "50")
        .attr("y1", "25")
        .attr("x2", "50")
        .attr("y2", "105")
        .attr("stroke", "black");

    // --- Density figure ----------

    density_svg.append("rect")
        .data(department_code_data.filter(d => d.dept_code === "All"))
        .attr("class", "stat_density_figure")
        .attr("fill", "#00ce71")
        .style("width", d => density_width_scale(d.average_density))
        .style("height", "30")
        .attr("x", "50")
        .attr("y", "50");

    // --- Density text ------------

    density_svg.append("text")
        .data(department_code_data.filter(d => d.dept_code === "All"))
        .attr("class", "stat_density_text")
        .attr("text-anchor", "start")
        .style("white-space", "pre-wrap")
        .attr("x", "60")
        .attr("y", "40")
        .text(d => "National average : " + d3.format(",d")(d.average_density) + " hab./km2");    

    // --- Population svg ----------
    
    let population_svg = additional_info_div.append("svg")
        .attr("class", "population_svg")
        .style("position", "relative")
        .style("width", w_add_inf)
        .style("height", 200)
        .style("left", 0)
        .style("top", 200);

    // --- Population scale --------

    population_width_scale = d3.scaleLog()
        .domain([1, d3.max(department_code_data, d => d.average_population)])
        .range([50, w_add_inf - 50]);

    // --- Population title -------- 

    population_svg.append("text")
        .attr("class", "stat_population_title")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("x", "-65")
        .attr("y", "40")
        .text("Population");

    // --- Population axis --------- 
    
    population_svg.append("line")
        .attr("class", "stat_population_axis")
        .attr("x1", "50")
        .attr("y1", "25")
        .attr("x2", "50")
        .attr("y2", "105")
        .attr("stroke", "black");

    // --- Population figure -------

    population_svg.append("rect")
        .data(department_code_data.filter(d => d.dept_code === "All"))
        .attr("class", "stat_population_figure")
        .attr("fill", "#0085c2")
        .style("width", d => population_width_scale(d.average_population))
        .style("height", "30")
        .attr("x", "50")
        .attr("y", "50");

    // --- Population  text --------

    population_svg.append("text")
        .data(department_code_data.filter(d => d.dept_code === "All"))
        .attr("class", "stat_population_text")
        .attr("text-anchor", "start")
        .style("white-space", "pre-wrap")
        .attr("x", "60")
        .attr("y", "40")
        .text(d => "National average : " + d3.format(",d")(d.average_population) + " hab.");

};


// ================
// Callbacks
// ================

// Import data
d3.tsv("data/france.tsv")

  // Data formatting
  .row( (d,i) => {
      return {
          codePostal: +d["Postal Code"],
          inseeCode: +d.inseecode,
          place: d.place,
          longitude: +d.x,
          latitude: +d.y,
          population: +d.population,
          density: +d.density
      };
  })

  // Plot data
  .get( (error, rows) => {

    // Print debug information
    console.log("Loaded " + rows.length + " rows");
    console.log("Missing values : " + rows.filter(d => isNaN(d.longitude)).length);

    // Register data in the variable dataset
    rows = rows.filter(d => !isNaN(d.longitude));
    dataset = rows;

    // Map construction
    map_constructor(dataset);

    // Additionnal information construction
    additional_info_constructor(dataset);

  });
