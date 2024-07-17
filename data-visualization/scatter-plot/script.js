d3.json("https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json")
  .then(response => {
      console.log(response); 
      makeChart(response);
  })
  .catch(error => {
      console.error('Error loading the data:', error);
  });

function makeChart(data) {
    const [w, h, padding, tip_width, tip_height] = [800, 500, 80, 160, 60];
    console.log(w, h, padding);

    //main svg
    const svg = d3.select('body')
        .append('svg')
        .attr('id', 'graph')
        .attr('width', w)
        .attr('height', h);

    //group for title texts
    const title_group = svg.append('g');
    title_group
    .append('text')
    .attr('id', 'title')
    .attr('x', w * 0.23)
    .attr('y', padding / 2)
    .attr('font-size', '30px')
    .text('Doping in Professional Bicycle Racing');

    title_group
    .append('text')
    .attr('x', w * 0.35)
    .attr('y', padding * 0.8)
    .attr('font-size', '20px')
    .text("35 Fastest times up Alpe d'Huez");

    title_group
    .append('text')
    .attr('x', w * 0.03)
    .attr('y', 3 * padding)
    .attr('font-size', '17px')
    .text('Time in Minutes')
    .attr('transform-origin', `${w * 0.03} ${3 * padding}`)
    .attr('transform', 'rotate(-90)');

    let caption = title_group.append('g')
    .attr('id', 'legend');
    let rects = caption.append('g');
    rects.append('rect')
    .attr('x', w * 0.90)
    .attr('y', h * 0.50)
    .attr('width', 15)
    .attr('height', 15)
    .attr('fill', 'rgb(243, 157, 94)');

    rects.append('rect')
    .attr('x', w * 0.90)
    .attr('y', h * 0.55)
    .attr('width', 15)
    .attr('height', 15)
    .attr('fill', 'rgb(64, 124, 178)');

    caption
    .append('text')
    .text('No doping allegations')
    .attr('x', w * 0.78)
    .attr('y', h * 0.52)
    .attr('font-size', '10px');

    caption
    .append('text')
    .text('Riders with doping allegations')
    .attr('x', w * 0.74)
    .attr('y', h * 0.57)
    .attr('font-size', '10px');


    //making scales and axis now
    xScale = d3
    .scaleLinear()
    .domain([d3.min(data, d => parseInt(d.Year)) - 1, d3.max(data, d => parseInt(d.Year)) + 1])
    .range([padding, w - padding]);

    xAxis = d3.axisBottom(xScale)
    .tickFormat(d3.format("d"));

    // for parsing time string in data and converting back to original format
    const parse = d3.timeParse('%M:%S');
    const format = d3.timeFormat('%M:%S');

    // calculate min and max data values
    const timeMin = d3.min(data, (d) => parse(d.Time));
    const timeMax = d3.max(data, (d) => parse(d.Time));
    console.log('timeMax=', timeMax);

    const yScale = d3.scaleTime()
    .domain([timeMin, timeMax])
    .range([padding, h - padding]);

    // set up y axis
    let tickVal = [Math.round(d3.min(data, d => d.Seconds) / 60) * 60];
    let tickCount = (d3.max(data, d => d.Seconds) - d3.min(data, d => d.Seconds)) / 15;
    for (let i = 1; i < tickCount; i++) {
    tickVal.push(tickVal[i - 1] + 15);
    }
    console.log('tickValues now:', tickVal);

    tickVal = tickVal.map(d => parse(`${Math.floor(d / 60)}:${(d % 60 == 0) ? '00' : ((d / 60 - Math.floor(d / 60)) * 60)}`));
    console.log('tickValues now:', tickVal);


    const yAxis = d3.axisLeft(yScale)
    .tickFormat(format)
    .ticks(tickCount)
    .tickValues(tickVal);


    let newd = [];
    // drawing circles
    svg.selectAll('circle')
    .data(data)
    .enter()
    .append('circle')
    .attr('class', 'dot')
    .attr('data-xvalue', d => d.Year)
    .attr('data-yvalue', d => parse(d.Time))
    .attr('cx', d => xScale(d.Year))
    .attr('cy', d => yScale(parse(d.Time)))
    .attr('r', 5)
    .attr('fill', d => d.Doping ? "rgb(64, 124, 178)" : "rgb(243, 157, 94)")
    .on('mouseover', (event, d) => {
        newd = [`${d.Name}: ${d.Nationality}`, `Year: ${d.Year}, Time: ${d.Time}`, `${d.Doping ? 'qwe' : ''}`, `${d.Doping}`];
        tip
        .style('visibility', 'visible')
        .style('opacity', '0.8')
        .attr('data-year', d.Year)
        .style('position', 'absolute')
        .style('top', `${event.clientY}px`)
        .style('left', `${event.clientX}px`)
        .selectAll('h1')
        .data(newd)
        .join('h1')
        .style('font-size', '10px')
        .text((data) => data)
        .style('visibility', data => (data === 'qwe') ? 'hidden' : 'visible');

        //tipText1.text(`${d.Name}: ${d.Nationality}`)
    })
    .on('mouseout', (event, d) => {
        tip
        .style('visibility', 'hidden')
        .style('opacity', '0');
    })
    .style('stroke', 'black')
    .style('stroke-width', '1');

    //calling axis
    svg.append('g')
    .attr('transform', `translate(0, ${h - padding})`)
    .attr('id', 'x-axis')
    .call(xAxis);

    svg.append('g')
    .attr('transform', `translate(${padding}, 0)`)
    .attr('id', 'y-axis')
    .call(yAxis);


    //creating tooltip
    const tip = d3.select('body').append('div')
    .attr('id', 'tooltip')
    .style('position', 'absolute')
    .style('background-color', "rgb(171, 190, 217)")
    .style('border-radius', '5px')
    .style('visibility', 'hidden')
    .style('opacity', '0');

}
