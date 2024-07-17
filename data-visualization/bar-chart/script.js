// Get data
d3.json("https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json")
  .then(response => {
      console.log(response); 
      makeChart(response.data);

      // Get source link
      const sourceLink = response.source_name;
      d3.select("#source-link").html(`<a href="${sourceLink}" target="_blank">Source: BEA.gov</a>`);

  })
  .catch(error => {
      console.error('Error loading the data:', error);
  });

function makeChart(ds) {
    const margin = {top: 30, right: 30, bottom: 50, left: 50},
        graphWidth = 800 - margin.left - margin.right, 
        graphHeight = 500 - margin.top - margin.bottom;
    
    // Parse data 
    const parseTime = d3.timeParse("%Y-%m-%d");

    // Set range
    const x = d3.scaleTime().range([0, graphWidth]);
    const y = d3.scaleLinear().range([graphHeight, 0]);

    // Define the axes
    const xAxis = d3.axisBottom(x);
    const yAxis = d3.axisLeft(y);

    // Select existing SVG and set dimensions
    const svg = d3.select("svg")
        .attr("width", 800)
        .attr("height", 500)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    // Format data 
    ds.forEach(function(d) {
        d.date = parseTime(d[0]);
        d.value = +d[1];
    });

    // Scale data range
    x.domain(d3.extent(ds, function(d) { return d.date; }));
    y.domain([0, d3.max(ds, function(d) { return d.value; })]);

    // Add X axis
    svg.append("g")
        .attr("transform", `translate(0, ${graphHeight})`)
        .attr("id", "x-axis")
        .call(xAxis);

    // Add Y axis
    svg.append("g")
        .attr("id", "y-axis")
        .call(yAxis);
    
    // Add bars
    svg.selectAll(".bar")
        .data(ds)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.date))
        .attr("y", d => y(d.value))
        .attr("width", graphWidth / ds.length - 2)
        .attr("height", d => graphHeight - y(d.value))
        .attr("data-date", d => d3.timeFormat("%Y-%m-%d")(d.date)) // Add data-date attribute
        .attr("data-gdp", d => d.value) // Add data-gdp attribute
        .style("fill", d => d.value > 500 ? "red" : "green")
        .on("mouseover", function(event, d) {
            const tooltip = d3.select("#tooltip");
            tooltip.transition().duration(200).style("opacity", 0.9);
            tooltip.html(`Date: ${d3.timeFormat("%Y-%m-%d")(d.date)}<br>GDP: ${d.value}`)
                .attr("data-date", d3.timeFormat("%Y-%m-%d")(d.date))
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
            d3.select("#tooltip").transition().duration(500).style("opacity", 0);
        });

    }