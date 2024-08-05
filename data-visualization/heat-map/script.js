d3.json("https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json")
  .then(response => {
      console.log(response); 
      makeChart(response);
  })
  .catch(error => {
      console.error('Error loading the data:', error);
  });

  function makeChart(data) {
    const [w, h, padding] = [1200, 600, 80];

    // Extract the base temperature and the data array from the response
    const baseTemperature = data.baseTemperature;
    const monthlyVariance = data.monthlyVariance;

    // Create the main SVG
    const svg = d3.select('body')
        .append('svg')
        .attr('id', 'heatmap')
        .attr('width', w)
        .attr('height', h);

    // Title
    svg.append('text')
        .attr('id', 'title')
        .attr('x', w / 2)
        .attr('y', padding / 2)
        .attr('text-anchor', 'middle')
        .attr('font-size', '30px')
        .text('Monthly Global Land-Surface Temperature');

    // Subtitle
    svg.append('text')
        .attr('id', 'description')
        .attr('x', w / 2)
        .attr('y', padding - 10)
        .attr('text-anchor', 'middle')
        .attr('font-size', '20px')
        .text('1753 - 2015: Base Temperature 8.66℃');

    // Scales
    const xScale = d3.scaleBand()
        .domain(monthlyVariance.map(d => d.year))
        .range([padding, w - padding])
        .padding(0.01);

    const yScale = d3.scaleBand()
        .domain(d3.range(12))
        .range([padding, h - padding])
        .padding(0.01);

    const colorScale = d3.scaleQuantize()
        .domain([d3.min(monthlyVariance, d => baseTemperature + d.variance), d3.max(monthlyVariance, d => baseTemperature + d.variance)])
        .range(d3.schemeRdYlBu[11].reverse());

    // Axes
    const xAxis = d3.axisBottom(xScale)
        .tickValues(xScale.domain().filter(year => year % 10 === 0))
        .tickFormat(d3.format("d"));

    const yAxis = d3.axisLeft(yScale)
        .tickFormat(month => {
            const date = new Date(0);
            date.setUTCMonth(month);
            return d3.timeFormat("%B")(date);
        });

    // Draw the axes
    svg.append('g')
        .attr('transform', `translate(0, ${h - padding})`)
        .attr('id', 'x-axis')
        .call(xAxis);

    svg.append('g')
        .attr('transform', `translate(${padding}, 0)`)
        .attr('id', 'y-axis')
        .call(yAxis);

    // Draw the heat map
    svg.selectAll('.cell')
        .data(monthlyVariance, d => `${d.year}:${d.month}`)
        .enter()
        .append('rect')
        .attr('class', 'cell')
        .attr('x', d => xScale(d.year))
        .attr('y', d => yScale(d.month - 1))
        .attr('width', xScale.bandwidth())
        .attr('height', yScale.bandwidth())
        .attr('fill', d => colorScale(baseTemperature + d.variance))
        .attr('data-year', d => d.year)
        .attr('data-month', d => d.month - 1)
        .attr('data-temp', d => baseTemperature + d.variance)
        .on('mouseover', (event, d) => {
            const tooltip = d3.select('#tooltip');
            tooltip
                .style('visibility', 'visible')
                .style('left', `${event.pageX + 10}px`)
                .style('top', `${event.pageY - 20}px`)
                .attr('data-year', d.year)
                .html(`Year: ${d.year}<br>Month: ${d3.timeFormat('%B')(new Date(0).setUTCMonth(d.month - 1))}<br>Temperature: ${(baseTemperature + d.variance).toFixed(2)}℃<br>Variance: ${d.variance.toFixed(2)}℃`);
        })
        .on('mouseout', () => {
            d3.select('#tooltip').style('visibility', 'hidden');
        });

    // Tooltip
    d3.select('body').append('div')
        .attr('id', 'tooltip')
        .style('position', 'absolute')
        .style('background-color', 'rgb(171, 190, 217)')
        .style('border-radius', '5px')
        .style('padding', '10px')
        .style('visibility', 'hidden');

    // Legend
    const legendWidth = 400;
    const legendHeight = 20;
    const legendPadding = 40; // Additional padding for the legend

    const legend = svg.append('g')
        .attr('id', 'legend')
        .attr('transform', `translate(${(w - legendWidth) / 2}, ${h - padding + legendPadding})`);

    const legendScale = d3.scaleLinear()
        .domain([d3.min(monthlyVariance, d => baseTemperature + d.variance), d3.max(monthlyVariance, d => baseTemperature + d.variance)])
        .range([0, legendWidth]);

    const legendAxis = d3.axisBottom(legendScale)
        .tickValues(colorScale.range().map(d => colorScale.invertExtent(d)[0]))
        .tickFormat(d3.format(".1f"));

    legend.selectAll('rect')
        .data(colorScale.range().map(d => colorScale.invertExtent(d)))
        .enter()
        .append('rect')
        .attr('x', d => legendScale(d[0]))
        .attr('y', 0)
        .attr('width', d => legendScale(d[1]) - legendScale(d[0]))
        .attr('height', legendHeight)
        .attr('fill', d => colorScale(d[0]));

    legend.append('g')
        .attr('transform', `translate(0, ${legendHeight})`)
        .call(legendAxis);
}