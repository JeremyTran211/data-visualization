d3.json("https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json")
  .then(response => {
      console.log(response); 
      makeChart(response);
  })
  .catch(error => {
      console.error('Error loading the data:', error);
  });

  function makeChart(data) {
    const margin = {top: 30, right: 30, bottom: 50, left: 50},
        graphWidth = 800 - margin.left - margin.right, 
        graphHeight = 500 - margin.top - margin.bottom;

    const parseTime = d3.timeParse("%Y");
    data.forEach(d => {
        d.Year = parseTime(d.Year.toString());
        d.Time = new Date(Date.UTC(1970, 0, 1, 0, d.Time.split(':')[0], d.Time.split(':')[1]));
    });

    // Set ranges
    const x = d3.scaleTime().range([0, graphWidth]);
    const y = d3.scaleTime().range([0, graphHeight]);

    // Define the axes
    const xAxis = d3.axisBottom(x).tickFormat(d3.timeFormat("%Y"));
    const yAxis = d3.axisLeft(y).tickFormat(d3.timeFormat("%M:%S"));

    // Create SVG container
    const svg = d3.select("svg")
        .attr("width", graphWidth + margin.left + margin.right)
        .attr("height", graphHeight + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const oneYear = 1000 * 60 * 60 * 24 * 365; 
    const dataExtent = d3.extent(data, d => d.Year);
    // Scale the range of the data
    x.domain([new Date(dataExtent[0].getTime() - oneYear), new Date(dataExtent[1].getTime() + oneYear)]);
    y.domain(d3.extent(data, d => d.Time));

    // Add the scatterplot points
    svg.selectAll(".dot")
        .data(data)
        .enter().append("circle")
        .attr("class", "dot")
        .attr("r", 5)
        .attr("cx", d => x(d.Year))
        .attr("cy", d => y(d.Time))
        .attr("data-year", d => d.Year.getFullYear())
        .attr("data-time", d => d.Time.toISOString())
        .style("fill", "#ffab00");

    // Add X Axis
    svg.append("g")
        .attr("transform", `translate(0,${graphHeight})`)
        .call(xAxis);

    // Add Y Axis
    svg.append("g")
        .call(yAxis);
}
