// Get data
d3.json("https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json")
  .then(response => {
      console.log(response); 
      makeChart(response.data);  
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
        .style("fill", d => d.value > 500 ? "red" : "green");

    svg.selectAll(".bar")
        .on("mouseover", function(event, d) {
            d3.select(this)
                .style("fill", "black");
        })
        .on("mouseout", function(event, d) {
            d3.select(this)
                .style("fill", d => d.value > 500 ? "red" : "green");
        });

    }