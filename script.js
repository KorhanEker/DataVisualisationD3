document.addEventListener('DOMContentLoaded', function () {
    var TIMEOUT = 120000;
    var interval = setInterval(handleNext, TIMEOUT);
    function handleNext() {

        var $radios = $('input[class*="slide-radio"]');
        var $activeRadio = $('input[class*="slide-radio"]:checked');

        var currentIndex = $activeRadio.index();
        var radiosLength = $radios.length;

        $radios
            .attr('checked', false);

        if (currentIndex == radiosLength - 1) {

            $radios
                .first()
                .attr('checked', true);

        } else {

            $activeRadio
                .next('input[class*="slide-radio"]')
                .attr('checked', true);

        }
    }
    let posX, posY;
    document.addEventListener('mousemove', (event) => {
        posX = event.clientX;
        posY = event.clientY;
    });

    const urls = {
        url_bar: 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json',
        url_scatter: 'https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/cyclist-data.json',
        url_heat: 'https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/global-temperature.json',
        url_education: 'https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/for_user_education.json',
        url_county_topology: 'https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/counties.json'
    };

    const colorScheme_long = [
        '#a50026',
        '#d73027',
        '#f46d43',
        '#fdae61',
        '#fee090',
        '#ffffbf',
        '#e0f3f8',
        '#abd9e9',
        '#74add1',
        '#4575b4',
        '#313695'
    ].reverse(); // from tones of red to blue 

    const colorScheme_short = ['#d7191c', '#fdae61', '#ffffbf', '#abd9e9', '#2c7bb6'].reverse();

    let dataset_Bar = [];
    let dataset_Scatter = [];
    let dataset_Heat = [];
    let dataset_Edu = [];
    let dataset_Geo = [];


    const requestAndProcessData = (req, type) => {
        var url = '';
        let w, h = 0;
        let x_label_pos = [];
        let y_label_pos = [];

        if (type === 'bar') { url = urls.url_bar; }
        else if (type === 'scatter') { url = urls.url_scatter; }
        else if (type === 'heat') { url = urls.url_heat; }
        if (type !== 'geo') {
            req.open('GET', url, true);
            req.send();
            req.onreadystatechange = function () {
                if (req.readyState !== 4) { return true; }
                else if (req.status === 200) {
                    if (type === 'bar') {
                        dataset_bar = JSON.parse(req.responseText);
                        w = 800;
                        h = 300;
                        y_label_pos = [-250, 100];
                        if (window.innerWidth < 850) {
                            w = 400;
                            y_label_pos[0] = -200;
                            y_label_pos[1] = 100;
                        }
                        calculate_Bar(dataset_bar, w, h, y_label_pos);
                        window.addEventListener('resize', function () {
                            if (window.innerWidth < 850) {
                                w = 400;
                                y_label_pos[0] = -200;
                                y_label_pos[1] = 100;
                            }
                            else {
                                w = 800;
                                y_label_pos[0] = -250;
                                y_label_pos[1] = 100;
                            }
                            calculate_Bar(dataset_bar, w, h, y_label_pos);
                        }, true);
                    }
                    else if (type === 'scatter') {
                        dataset_Scatter = JSON.parse(req.responseText);
                        dataset_Scatter.forEach((d) => {
                            var timeStr = d.Time;
                            var parsedTime = timeStr.split(':');
                            var myTime = new Date(0);
                            myTime.setUTCMinutes(parsedTime[0]);
                            myTime.setUTCSeconds(parsedTime[1]);
                            d.Time = myTime;//new Date(Date.UTC(1970, 0, 1, 0, parsedTime[0], parsedTime[1])); -> remember that months are 0-based in JS, date and years are 1-based
                            // Date.UTC returns milliseconds passed from 1970 to the given date/time. 
                            // That's why we have given 1970,0,1,0 within UTC method
                        });
                        w = 800;
                        h = 280;
                        x_label_pos[0] = (w + 145) / 2;
                        x_label_pos[1] = h + 50;
                        y_label_pos[0] = -(h + 100) / 2;
                        y_label_pos[1] = 20;
                        if (window.innerWidth < 850) {
                            w = 400;
                            h = 280;
                            x_label_pos[0] = (w + 120) / 2;
                            x_label_pos[1] = h + 30;
                            y_label_pos[0] = -(h + 100) / 2;
                            y_label_pos[1] = 20;
                        }
                        calculate_Scatter(dataset_Scatter, w, h, x_label_pos, y_label_pos);
                        window.addEventListener('resize', function () {
                            if (window.innerWidth < 850) {
                                w = 400;
                                h = 280;
                                x_label_pos[0] = (w + 120) / 2;
                                x_label_pos[1] = h + 30;
                                y_label_pos[0] = -(h + 100) / 2;
                                y_label_pos[1] = 20;
                            }
                            else {
                                w = 800;
                                h = 280;
                                x_label_pos[0] = (w + 145) / 2;
                                x_label_pos[1] = h + 50;
                                y_label_pos[0] = -(h + 100) / 2;
                                y_label_pos[1] = 20;
                            }
                            calculate_Scatter(dataset_Scatter, w, h, x_label_pos, y_label_pos);
                        }, true);
                    }
                    else if (type === "heat") {
                        dataset_Heat = JSON.parse(req.responseText);
                        dataset_Heat.monthlyVariance.forEach((val) => (val.month -= 1)); // for 0 based indexing
                        w = 800;
                        h = 280;
                        x_label_pos[0] = (w + 100) / 2;
                        x_label_pos[1] = h + 50;
                        y_label_pos[0] = -(h / 2);
                        y_label_pos[1] = 10;
                        if (window.innerWidth < 850) {
                            w = 400;
                            h = 260;
                            x_label_pos[0] = (w + 120) / 2;
                            x_label_pos[1] = h + 40;
                            y_label_pos[0] = -(h / 2);
                            y_label_pos[1] = 10;
                        }
                        calculate_Heat(dataset_Heat, w, h, x_label_pos, y_label_pos);
                        window.addEventListener("resize", function () {
                            if (window.innerWidth < 850) {
                                w = 400;
                                h = 260;
                                x_label_pos[0] = (w + 120) / 2;
                                x_label_pos[1] = h + 40;
                                y_label_pos[0] = -(h / 2);
                                y_label_pos[1] = 10;
                            } else {
                                w = 800;
                                h = 280;
                                x_label_pos[0] = (w + 145) / 2;
                                x_label_pos[1] = h + 50;
                                y_label_pos[0] = -(h + 100) / 2;
                                y_label_pos[1] = 20;
                            }
                            calculate_Heat(dataset_Heat, w, h, x_label_pos, y_label_pos);
                        });
                    }
                }
                else if (req.status === 404) {
                    let chartError;
                    if (type === 'bar') {
                        chartError = d3.select('.barChart');
                    }
                    else if (type === 'scatter') {
                        chartError = d3.select('.scatterChart')
                    }
                    else if (type === 'heat') {
                        chartError = d3.select('.heatChart');
                    }
                    chartError.append('p')
                        .attr('id', 'error_text_data')
                        .style('font-size', '32px')
                        .style('text-align', 'center')
                        .style('word-break', 'break-all')
                        .html('Error Loading Data. URL used : <br>' + url);
                }
            }
        }
        else {
            //geo
            w = 960;
            h = 600;
            if (window.innerWidth < 850) {
                w = 500;
            }
            calculate_Geo(w, h);
            window.addEventListener('resize', function () {
                if (window.innerWidth < 850) {
                    w = 500;
                }
                else {
                    w = 960;
                }
                calculate_Geo(w, h);
            });
        }
    }

    const calculate_Bar = function (dataset, w, h, y_label_pos) {
        const padding = 60;
        const barWidth = w / 275;

        d3.select('.bar-graph').remove();
        d3.select('.overlay').remove();
        d3.select('#tooltip').remove();

        let svgViz = d3.select('.barChart')
            .append('svg')
            .attr('height', h + 60)
            .attr('width', w + 100)
            .attr('class', 'bar-graph');

        const dateVals = dataset.data.map((obj) => new Date(obj[0]));
        const dateQuarters = dataset.data.map((obj) => {
            var quarter;
            var month = obj[0].substring(5, 7);
            switch (month) {
                case '01':
                    quarter = 'Q1';
                    break;
                case '04':
                    quarter = 'Q2';
                    break;
                case '07':
                    quarter = 'Q3';
                    break;
                case '10':
                    quarter = 'Q4';
                    break;
                default:
            }
            return obj[0].substring(0, 4) + ' ' + quarter;
        });

        let dateMax = new Date(d3.max(dateVals));
        let dateMin = new Date(d3.min(dateVals));
        dateMax.setMonth(dateMax.getMonth() + 3); // we added one quarter more to display the values more properly and without overflow


        let xScale = d3.scaleTime() // instead of scaleLinear, we need to use scaleTime for time series
            .domain([d3.min(dateVals), dateMax])
            .range([0, w]);

        const gdpVals = dataset.data.map((obj) => obj[1]);
        const gdpMax = d3.max(gdpVals) + 500;
        let yScaler = d3.scaleLinear()
            .domain([0, gdpMax])
            .range([0, h]);

        const gdpValsScaled = gdpVals.map((obj) => yScaler(obj));

        let yScale = d3.scaleLinear()
            .domain([0, gdpMax])
            .range([h, 0]);

        let xAxis = d3.axisBottom().scale(xScale);
        let yAxis = d3.axisLeft(yScale);



        svgViz.append('g')
            .call(xAxis)
            .attr('id', 'x-axis-bar')
            .attr('transform', 'translate(' + padding + ',' + h + ')');

        svgViz.append('g')
            .call(yAxis)
            .attr('id', 'y-axis-bar')
            .attr('transform', 'translate(' + padding + ',' + 0 + ')');

        svgViz.append('text')
            .attr('id', 'y-axis-label')
            .attr('transform', 'rotate(-90)')
            .attr('x', y_label_pos[0])
            .attr('y', y_label_pos[1])
            .text('Gross Domestic Product')


        let tooltip = d3.select('.barChart').append('div')
            .attr('id', 'tooltip')
            .style('opacity', 0);

        let overlay = d3.select('.barChart').append('div')
            .attr('class', 'overlay')
            .style('opacity', 0)

        d3.select('svg').selectAll('rect')
            .data(gdpValsScaled)
            .enter()
            .append('rect')
            .attr('data-date', (d, i) => dataset.data[i][0]) //data-* is used to create a custom attribute
            .attr('data-gdp', (d, i) => dataset.data[i][1])
            .attr('data-index', (d, i) => i)
            .attr('class', 'bar')
            .attr('x', function (d, i) { return xScale(dateVals[i]) })
            .attr('y', function (d, i) { return h - d })
            .attr('width', barWidth)
            .attr('height', (d) => d)
            .style('fill', '#259B9A')
            .style('transform', 'translateX(' + padding + 'px)')
            .on('mouseover', (d, i) => {
                var leftPos = i * barWidth;
                var heightToolTip = (window.innerWidth < 850) ? h - 100 : h - 150;
                var leftPosTooltip = (window.innerWidth < 850) ? i * barWidth - 100 : i * barWidth - 150;
                var topPos = h - d;
                overlay.transition().duration(0)
                    .style('height', d + 'px')
                    .style('width', barWidth + 'px')
                    .style('opacity', 0.8)
                    .style('left', leftPos + 'px')
                    .style('top', topPos + 'px')
                    .style('transform', 'translateX(' + padding + 'px)');
                tooltip.transition().duration(200).style('opacity', 0.9);
                tooltip
                    .html(dateQuarters[i] + '<br>' + '$' + gdpVals[i] + ' Billion')
                    .attr('data-date', dataset.data[i][0])
                    .style('left', leftPosTooltip + 'px')
                    .style('top', heightToolTip + 'px')
                    .style('transform', 'translateX(' + padding + 'px)');
            })
            .on('mouseout', function () {
                tooltip.transition().duration(200).style('opacity', 0);
                overlay.transition().duration(200).style('opacity', 0);
            })
    }

    const calculate_Scatter = function (dataset, width, height, x_label_pos, y_label_pos) {

        const padding = 65;
        let timeFormat = d3.timeFormat('%M:%S');

        timeVals = dataset.map((obj) => obj.Time);

        let maxTime = d3.max(timeVals);
        let minTime = d3.min(timeVals);
        maxTime = new Date(maxTime.getTime() + 60000 * 1);
        minTime = new Date(minTime.getTime() - 60000 * 1);
        let x = d3.scaleLinear()
            .domain([d3.min(dataset, (d) => d.Year - 1), d3.max(dataset, (d) => d.Year + 1)])
            .range([0, width]);

        let y_scaler = d3.scaleTime()
            .domain([minTime, maxTime])
            .range([0, height]);

        const scaledTimeVals = timeVals.map((obj) => y_scaler(obj));

        let y = d3.scaleTime()
            .domain([minTime, maxTime]) //d3.extent(dataset, (d) => d.Time) - extent returns the minimum and maximum value in an array from the given array using natural order.
            .range([0, height]);

        let color = d3.scaleOrdinal(d3.schemeCategory10) //The d3.schemeCategory10 method in D3.js is used to return an array of ten categorical colors which is returned as RGB hexadecimal strings.
        let xAxis = d3.axisBottom(x).tickFormat(d3.format('d')); // The d3.axis.tickFormat() Function in D3.js is used to control which ticks are labelled. This function is used to implement your own tick format function.
        // 'd' used for  decimal notation, rounded to integer.
        let yAxis = d3.axisLeft(y).tickFormat(timeFormat);

        d3.select('#scatter-graph').remove();
        d3.select('#tooltip_scatter').remove();

        let svg = d3.select('.scatterChart')
            .append('svg')
            .attr('width', width + 80)
            .attr('height', height + 60)
            .attr('id', 'scatter-graph');

        svg.append('g')
            .call(xAxis)
            .attr('class', 'x-axis axis')
            .attr('id', 'x-axis-scatter')
            .attr('transform', 'translate(' + padding + ',' + height + ')');

        svg.append('g')
            .attr('class', 'y-axis axis')
            .attr('id', 'y-axis-scatter')
            .call(yAxis)
            .attr('transform', 'translate(' + padding + ',' + 0 + ')');

        svg.append('text')
            .attr('class', 'y-axis-label')
            .attr('transform', 'rotate(-90)')
            .attr('x', y_label_pos[0])
            .attr('y', y_label_pos[1])
            .text('Time in Minutes');

        let tooltip_scatter = d3.select('.scatterChart')
            .append('div')
            .attr('class', 'tooltip_scatter')
            .attr('id', 'tooltip_scatter')
            .style('opacity', 0);

        svg.append('text')
            .attr('class', 'x-axis-label')
            .attr('x', x_label_pos[0])
            .attr('y', x_label_pos[1])
            .style('font-weight', 'bold')
            .style('text-anchor', 'end')
            .text('Year');

        var dotSize = (window.innerWidth < 850) ? 1.5 : 3;
        svg.selectAll('.dot')
            .data(dataset)
            .enter()
            .append('circle')
            .attr('class', 'dot')
            .attr('r', dotSize)
            .attr('cx', (d) => x(d.Year))
            .attr('cy', (d) => y(d.Time))
            .attr('data-xvalue', (d, i) => d.Year)
            .attr('data-yvalue', (d) => d.Time.toISOString())
            .style('fill', (d) => color(d.Doping !== ''))
            .attr('transform', 'translate(' + padding + ',0)')
            .on('mouseover', (d, i) => {
                tooltip_scatter.style('opacity', 0.9);
                posX = (window.innerWidth > 850) ? (posX - 250) : (posX - 130);
                posY = (window.innerWidth > 850) ? (posY - 200) : (posY - 170);
                tooltip_scatter
                    .attr('data-year', d.Year)
                    .html(
                        d.Name +
                        ': ' +
                        d.Nationality +
                        '<br/>' +
                        'Year: ' +
                        d.Year +
                        ', Time: ' +
                        timeFormat(d.Time) +
                        (d.Doping ? '<br/><br/>' + d.Doping : '')
                    )
                    .style('left', posX + 'px')
                    .style('top', posY + 'px');
            })
            .on('mouseout', () => {
                tooltip_scatter.style('opacity', 0);
            })

        let legendArea = svg.append('g')
            .attr('id', 'legend');



        let legend = legendArea.selectAll('#legend')
            .data(color.domain())
            .enter()
            .append('g')
            .attr('class', 'legend-label')
            .attr('transform', (d, i) => {
                var legendMoveX = 70;
                var legendMoveY = (window.innerWidth > 850) ? (height / 4.5 - i * 25) : (height / 5 - i * 25);
                return 'translate(' + legendMoveX + ',' + legendMoveY + ')';
            });


        var rectSize = (window.innerWidth < 850) ? 15 : 18;
        legend
            .append('rect')
            .attr('x', width - 18)
            .attr('width', rectSize)
            .attr('height', rectSize)
            .style('fill', color);

        var fontSize = (window.innerWidth < 850) ? 10 : 14;
        legend
            .append('text')
            .attr('x', width - 24)
            .attr('y', 9)
            .attr('dy', '.35em')
            .style('text-anchor', 'end')
            .style('font-size', fontSize + 'px')
            .attr('class', 'scatter-legend-text')
            .text(function (d) {
                if (d) {
                    return 'Riders with doping allegations';
                } else {
                    return 'No doping allegations';
                }
            });
    }

    const calculate_Heat = function (dataset, width, height, x_label_pos, y_label_pos) {

        var colorScheme = (window.innerWidth < 850) ? colorScheme_short : colorScheme_long;
        const fontSize = 16;
        const padding = {
            left: 5 * fontSize,
            right: 5 * fontSize,
            top: 1 * fontSize,
            bottom: 8 * fontSize
        };


        d3.select('#heat-graph').remove();
        d3.select('#tooltip_heat').remove();


        let svg = d3.select('.heatChart')
            .append('svg')
            .attr('width', width + 80)
            .attr('height', height + 80)
            .attr('id', 'heat-graph')
            .attr('transform', 'translate(0,' + (-padding.top) + ')');

        let yScale = d3.scaleBand()
            .domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
            .rangeRound([0, height], 0, 0);

        let yAxis = d3.axisLeft(yScale)
            .tickFormat((month) => {
                var date = new Date(0);
                date.setUTCMonth(month);
                var formatTime = d3.timeFormat('%B')
                return formatTime(date);
            })
            .tickSize(10, 1); //setting inner and outer tick sizes.

        var Years = dataset.monthlyVariance.map((obj) => obj.year);
        Years.sort();
        let xScale = d3.scaleBand()
            .domain(Years)
            .range([0, width]);

        function filterM(d) {
            if (window.innerWidth < 850) { return d % 20 === 0 }
            else { return d % 10 === 0 }
        }
        let xAxis = d3.axisBottom(xScale).tickFormat(d3.format('d'))
            .tickValues(Years.filter(filterM)) // set ticks to years divisible by 10
            .tickSize(8, 1);

        svg.append('g')
            .attr('class', 'y-axis-heat')
            .attr('id', 'y-axis-heat')
            .attr('transform', 'translate(' + padding.left + ',' + padding.top + ')')
            .call(yAxis);

        svg.append('text')
            .text('Months')
            .attr('class', 'y-axis-label')
            .style('text-anchor', 'end')
            .attr('x', y_label_pos[0])
            .attr('y', y_label_pos[1])
            .attr('transform', 'rotate(-90)');

        svg.append('g')
            .attr('class', 'x-axis-heat')
            .attr('id', 'x-axis-heat')
            .attr('transform',
                'translate(' + padding.left + ',' + (height + padding.top) + ')'
            )
            .call(xAxis);

        svg.append('text')
            .attr('class', 'x-axis-label')
            .attr('id', 'x-axis-label')
            .text('Years')
            .attr('transform', 'translate(' + ((width + padding.left) / 2) + ',' + (height + 4 * fontSize) + ')');

        let tooltip_heat = d3.select('.heatChart').append('div')
            .attr('id', 'tooltip_heat')
            .style('opacity', 0);

        var legendWidth = (window.innerWidth < 850) ? 200 : 300;
        var legendHeight = (window.innerWidth < 850) ? 20 : 30;

        var variance = dataset.monthlyVariance.map((obj) => obj.variance);
        var minTemp = dataset.baseTemperature + d3.min(dataset.monthlyVariance, (d) => d.variance);
        var maxTemp = dataset.baseTemperature + d3.max(dataset.monthlyVariance, (d) => d.variance);

        var legendThreshold = d3.scaleThreshold()
            .domain(
                (function (min, max, count) {
                    var array = [];
                    var step = (max - min) / count;
                    var base = min;
                    for (var i = 1; i < count; i++) {
                        array.push(base + i * step)
                    }
                    return array;
                })(minTemp, maxTemp, colorScheme.length))
            .range(colorScheme);

        var legendX = d3.scaleLinear()
            .domain([minTemp, maxTemp])
            .range([0, legendWidth]);

        var axisTickSize = (window.innerWidth < 850) ? 3 : 5;
        var legendXAxis = d3.axisBottom(legendX)
            .tickSize(axisTickSize, 0)
            .tickValues(legendThreshold.domain())
            .tickFormat(d3.format('.1f'));

        var posLegX = padding.left / 5;
        var posLegY = height + 30;
        var legend = svg
            .append('g')
            .classed('legend', true)
            .attr('id', 'legend')
            .attr('transform', 'translate(' + posLegX + ',' + posLegY + ')');

        legend
            .append('g')
            .selectAll('rect')
            .data(
                legendThreshold.range().map(function (color) {
                    var d = legendThreshold.invertExtent(color);
                    if (d[0] === null || d[0] === undefined) {
                        d[0] = legendX.domain()[0];
                    }
                    if (d[1] === null || d[1] === undefined) {
                        d[1] = legendX.domain()[1];
                    }
                    return d;
                })
            )
            .enter()
            .append('rect')
            .style('fill', (d) => legendThreshold(d[0]))
            .attr('x', (d) => legendX(d[0]))
            .attr('y', (d) => (window.innerWidth < 850 ? -10 : -20))
            .attr('width', (d) => legendX(d[1]) - legendX(d[0]))
            .attr('height', legendHeight / 2)
            .attr('transform', 'translate(' + 0 + ',' + legendHeight + ')')


        legend
            .append("g")
            .attr("transform", "translate(" + 0 + "," + legendHeight + ")")
            .call(legendXAxis);


        let color, strokeColor;

        svg.append('g')
            .attr('class', 'map')
            .attr('transform', 'translate(' + padding.left + ',' + padding.top + ')')
            .selectAll('rect')
            .data(dataset.monthlyVariance)
            .enter()
            .append('rect')
            .attr('class', 'cell')
            .attr('data-id', (d, i) => i)
            .attr('data-month', (d) => d.month)
            .attr('data-year', (d) => d.year)
            .attr('data-temp', (d) => d.variance + dataset.baseTemperature)
            .attr('x', (d) => xScale(d.year))
            .attr('y', (d) => yScale(d.month))
            .attr('width', (d) => xScale.bandwidth())
            .attr('height', (d) => yScale.bandwidth())
            .attr('fill', (d) => legendThreshold(dataset.baseTemperature + d.variance))
            .on('mouseover', (d, i) => {
                var rectangle = d3.select("[data-id='" + i + "']");
                color = rectangle.attr('fill');
                strokeColor = rectangle.style('stroke');
                rectangle.style('stroke', 'black');
                var date = new Date(d.year, d.month);
                var str = d3.timeFormat('%Y - %B')(date) +
                    '<br/>' +
                    d3.format('.1f')(dataset.baseTemperature + d.variance) + '&#8451;' +  // unicode decimal code for Celcius Degree
                    '<br/>' +
                    d3.format('+.1f')(d.variance) + '&#8451;';
                tooltip_heat.style('opacity', 0.9);
                tooltip_heat
                    .html(str)
                    .attr('data-year', d.year)
                    .style('left', (posX - 250) + 'px')
                    .style('top', (posY - 180) + 'px');
            })
            .on('mouseout', (d, i) => {
                var rectangle = d3.select("[data-id='" + i + "']");
                rectangle.attr('fill', color);
                rectangle.style('stroke', strokeColor);
                rectangle.classed('cell', true);
                tooltip_heat.style('opacity', 0);
            });
    }

    const calculate_Geo = function (width, height) {
        d3.select('#geo-graph').remove();
        d3.select('#tooltip_geo').remove();

        var svg = d3.select('.geoChart')
            .append('svg')
            .attr('width',width)
            .attr('height', height)
            .attr('id', 'geo-graph');

        var tooltip = d3.select('.geoChart')
            .append('div')
            .attr('id', 'tooltip_geo')
            .style('opacity', 0);

       

        var x = d3.scaleLinear().domain([2.6, 75.1]).rangeRound([600, 860]);

        var color = d3
            .scaleThreshold()
            .domain(d3.range(2.6, 75.1, (75.1 - 2.6) / 8))
            .range(d3.schemeGreens[9]);

        var g = svg
            .append('g')
            .attr('class', 'key')
            .attr('id', 'legend')
            .attr('transform', 'translate(0,40)');

        g.selectAll('rect')
            .data(
                color.range().map(function (d) {
                    d = color.invertExtent(d);
                    if (d[0] === null || d[0] === undefined) {
                        d[0] = x.domain()[0];
                    }
                    if (d[1] === null || d[1] === undefined) {
                        d[1] = x.domain()[1];
                    }
                    return d;
                })
            )
            .enter()
            .append('rect')
            .attr('height', 8)
            .attr('x', function (d) {
                return x(d[0]);
            })
            .attr('width', function (d) {
                return x(d[1]) - x(d[0]);
            })
            .attr('fill', function (d) {
                return color(d[0]);
            });

        g.append('text')
            .attr('class', 'caption')
            .attr('x', x.range()[0])
            .attr('y', -6)
            .attr('fill', '#000')
            .attr('text-anchor', 'start')
            .attr('font-weight', 'bold');

        g.call(
            d3
                .axisBottom(x)
                .tickSize(13)
                .tickFormat(function (x) {
                    return Math.round(x) + '%';
                })
                .tickValues(color.domain())
        )
            .select('.domain')
            .remove();

        d3.queue()
            .defer(d3.json, urls.url_county_topology)
            .defer(d3.json, urls.url_education)
            .await(ready);

        function ready(error, us, education) {
            if (error) {
                throw error;
            }
  
            var path = d3.geoPath();

            svg
                .append('g')
                .attr('class', 'counties')
                .selectAll('path')
                .data(topojson.feature(us, us.objects.counties).features)
                .enter()
                .append('path')
                .attr('class', 'county')
                .attr('data-fips', function (d) {
                    return d.id;
                })
                .attr('data-education', function (d) {
                    var result = education.filter(function (obj) {
                        return obj.fips === d.id;
                    });
                    if (result[0]) {
                        return result[0].bachelorsOrHigher;
                    }
                    // could not find a matching fips id in the data
                    console.log('could find data for: ', d.id);
                    return 0;
                })
                .attr('fill', function (d) {
                    var result = education.filter(function (obj) {
                        return obj.fips === d.id;
                    });
                    if (result[0]) {
                        return color(result[0].bachelorsOrHigher);
                    }
                    // could not find a matching fips id in the data
                    return color(0);
                })
                .attr('d', path)
                .on('mouseover', function (d) {
                    tooltip.style('opacity', 0.9);
                    tooltip
                        .html(function () {
                            var result = education.filter(function (obj) {
                                return obj.fips === d.id;
                            });
                            if (result[0]) {
                                return (
                                    result[0]['area_name'] +
                                    ', ' +
                                    result[0]['state'] +
                                    ': ' +
                                    result[0].bachelorsOrHigher +
                                    '%'
                                );
                            }
                            // could not find a matching fips id in the data
                            return 0;
                        })
                        .attr('data-education', function () {
                            var result = education.filter(function (obj) {
                                return obj.fips === d.id;
                            });
                            if (result[0]) {
                                return result[0].bachelorsOrHigher;
                            }
                            // could not find a matching fips id in the data
                            return 0;
                        })
                        .style('left', (posX - 150) + 'px')
                        .style('top',  (posY - 100) + 'px');
                })
                .on('mouseout', function () {
                    tooltip.style('opacity', 0);
                });
        }
    }


    requestAndProcessData(new XMLHttpRequest(), 'bar');
    requestAndProcessData(new XMLHttpRequest(), 'scatter');
    requestAndProcessData(new XMLHttpRequest(), 'heat');
    requestAndProcessData(new XMLHttpRequest(), 'geo');
});
