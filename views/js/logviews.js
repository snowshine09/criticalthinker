var self = this;

var query = {};
$(document).ready(function(){
    $("#vis-startdate").datepicker({
        changeMonth: true,
        changeYear: true,
        format: 'mm/dd/yyyy'
    });
    
    $("#vis-enddate").datepicker({
        changeMonth: true,
        changeYear: true,
        format: 'mm/dd/yyyy'

    });
    

    $('.ui.dropdown.topic')
    .dropdown({
        onChange: function(val) {
            if (val) {
                query.topic = val;
                $.ajax({
                    url: "/actsave",
                    data: {
                        type: "switch topic to see visualization",
                        content: {
                            newtopic: val
                        }
                    },
                    method: "PUT"
                })
                .done(function(data) {
                    console.log('act saved');
                });
            }
            else query.topic = undefined;
        }
    });
    $('.ui.dropdown.interaction')
    .dropdown({
        onChange: function(val) {
            if (val) {
                query.interaction = val;
                $.ajax({
                    url: "/actsave",
                    data: {
                        type: "switch interaction to see visual trends",
                        content: {
                            interaction: val
                        }
                    },
                    method: "PUT"
                })
                .done(function(data) {
                    console.log('act saved');
                });
            }
            else query.interaction = 'autosave user input';
        }
    });

    $('.ui.dropdown.bc.users')
    .dropdown({
        // useLabels: false,
        onChange: function(value, text, $selectedItem) {
            if(value) {
                query.names = value.split(',');
            }
            else query.names = undefined;
        }
    });
    $("#themeriver-generate").click(function(e) {
        console.log("clicked generate");
        $.ajax({
            url: 'visdata/',
            method: 'GET',
            data: {
                start: $("#vis-startdate").datepicker().val(),
                end: $("#vis-enddate").datepicker().val(),
                users: query.names,
                type: $
            }
        })
        .done(function(items) {
            DrawTR("autosave user input", items);
        });

    });
    $("#bc-generate").click(function(e) {
        console.log("clicked generate");

        var fullnames = [];
        // if(query.names) {
        //     $('.menu.user>.item')
        // }
        $.ajax({
            url: 'visdata/',
            method: 'GET',
            data: {
                start: $("#vis-startdate").datepicker().val(),
                end: $("#vis-enddate").datepicker().val(),
                users: query.names,
                interact: query.interaction
            }
        })
        .done(function(items) {
            DrawBC(query.interaction, items);
        });

    });
});//close of the document ready






var DrawTR = function(type, items) {
    $("#themeriver-area")[0].innerHTML= '';
    var colorrange = ["#7700ff", "#00bbff", "#ff6d10", "#f9ff38", "#ff3838", "#aaff38"];
    var margin = {
        top: 10,
        right: 0,
        bottom: 60,
        left: 50
    };
    var datearray = [];

    // convert data string time
    var format = d3.time.format("%Y-%m-%dT%H:%M:%S.%LZ");//d3.time.format("%Y-%m-%dT%H:%M:%S.%LZ");("%a %b %e %Y %H:%M:%S GMT%Z (EDT)");
    
    switch(type){
        case 'autosave user input':
        items.forEach(function(d) {
            d.time = format.parse(d.time);
        });
        break;
        case "logged in":
        items.forEach(function(d) {
            d.time = format.parse(d.time);
            d.value = d.end - d.start;
        });
        break;
        case "Idle status":
        break;
        default:break;
    }
    

    // get dimensions of the chart area
    var toolbar_height = $("#themeriver-toolbar").height();
    var width = 660;//window.width- margin.left - margin.right;//$("#themeriver-window").dialog('widget').width()
    var height = 460;//window.height - margin.top - margin.bottom - toolbar_height;

    var tooltip = d3.select("#themeriver-area")
    .append("div")
    .attr("class", "remove")
    .style("position", "absolute")
    .style("visibility", "hidden");

    var x = d3.time.scale().range([0, width]);
    var y = d3.scale.linear().range([height - 10, 0]);
    var z = d3.scale.ordinal().range(colorrange);

    var stack = d3.layout.stack().offset("silhouette").values(function(d) {
        return d.values;
    }).x(function(d) {
        return d.time;
    }).y(function(d) {
        return +d.edit.length;
    });
    
    var svg = d3.select("#themeriver-area")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ") scale(0.9)");

    var nest = d3.nest().key(function(d) {
        return d.username;
    });
    var layers = stack(nest.entries(items));

    var area = d3.svg.area().interpolate("monotone").x(function(d) {
        return x(d.time);
    }).y0(function(d) {
        return y(d.y0);
    }).y1(function(d) {
        return y(d.y0 + d.y);
    });
    // set the range of x/y domains
    x.domain(d3.extent(items, function(d) {
        return d.time;
    }));
    y.domain([0, d3.max(items, function(d) {
        return d.y0 + d.y;
    })]);

    // draw paths
    svg.selectAll(".layer")
    .data(layers)
    .enter()
    .append("path")
    .attr("class", "layer")
    .attr("id", "themeriver-path")
    .attr("data-legend", function(d) {
        return d.key
    }).attr("d", function(d) {
        return area(d.values);
    }).style("fill", function(d, i) {
        return z(i);
    });

    // draw the axes
    var xAxis = d3.svg.axis().scale(x).orient("bottom");
    var yAxis = d3.svg.axis().scale(y);
    svg.append("g").attr("class", "x axis").attr("transform", "translate(0," + height + ")").call(xAxis);
    svg.append("g").attr("class", "y axis").call(yAxis.orient("left"));

    // mouseover event: opacity
    svg.selectAll(".layer").attr("opacity", 1).on("mouseover", function(d, i) {
        svg.selectAll(".layer").transition().duration(250).attr("opacity", function(d, j) {
            return j != i ? 0.6 : 1;
        })
    })
        // mousemove event: add tooltip & add stroke highlight
        .on("mousemove", function(d, i) {
            mousex = d3.mouse(this);
            mousex = mousex[0];
            var invertedx = x.invert(mousex);
            invertedx = invertedx.getMonth() + invertedx.getDate();
            var selected = (d.values);
            for ( var k = 0; k < selected.length; k++) {
             datearray[k] = selected[k].time.getMonth() + selected[k].time.getDate();
         }

         mousedate = datearray.indexOf(invertedx);
         var cursor_time = d.values[mousedate].time, cursor_value= d.values[mousedate]['edit'];

         d3.select(this).classed("hover", true)
         .attr("stroke", colorrange[0])
         .attr("stroke-width", "0.5px");

         tooltip.html("<p>" + d.key + "<br>" + cursor_time + "<br>" + cursor_value + "</p>")
         .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
         .style("visibility", "visible")
         .style("left", (d3.event.pageX + "px"))
         .style("top", (d3.event.pageY  + "px"));
     })
        // mouseout event: remove tooltip & remove stroke highlight
        .on("mouseout", function(d, i) {
            svg.selectAll(".layer").transition().duration(250).attr("opacity", "1");
            d3.select(this)
            .classed("hover", false)
            .attr("stroke-width", "0px")

            tooltip.html("")
            .style("visibility", "hidden");
        })

    // draw legend
    //legend = svg.append("g").attr("class", "legend").attr("transform", "translate(50,30)").style("font-size", "12px").call(d3.legend)

    // draw vertical line
    var vertical = d3.select("#themeriver-area")
    .append("div")
    .attr("class", "remove")
    .style("position", "absolute")
    .style("z-index", "19")
    .style("width", "1px")
    .style("height", $("#themeriver-path").height() + "px")
    .style("top", toolbar_height + "px")
    .style("bottom", "30px")
    .style("left", "0px")
    .style("background", "#fff");

    // vertical line movement
    d3.select("#themeriver-area").on("mousemove", function() {
        mousex = d3.mouse(this);
        mousex = mousex[0] + 5;
        vertical.style("left", mousex + "px")
    }).on("mouseover", function() {
        mousex = d3.mouse(this);
        mousex = mousex[0] + 5;
        vertical.style("left", mousex + "px")
    });
}

var DrawBC= function(type, items){
    var bctitle1 ='bar chart', bcy = 'Editing amount', bcunit ='', vdata1 = [], vdata2 = [], tt_amount;
    var nest = d3.nest().key(function(d) {
        return d.username;
    });
    var puser = nest.entries(items);
    switch(type){
        case 'autosave user input': 
        bctitle1 = 'Browse students\' overall editing behaviors from selected time range';
        bcy = 'Editing amount';
        bcunit = 'words';
        for (var i =0 ; i < puser.length; i++) {
            var vcol = {}, vcol_user = {};
            vcol['name'] = puser[i].key;
            vcol['drilldown'] = puser[i].key;
            vcol_user['name'] = puser[i].key;
            vcol_user['id'] = puser[i].key;
            vcol_user['data'] = [];
            vcol['y'] = 0;
            vcol['color'] = randomColor();
            for (var j = 0; j < puser[i].values.length; j++) {
                vcol['y'] += puser[i].values[j].edit.length;
                vcol_user['data'].push([puser[i].values[j].time.substring(0,10), puser[i].values[j].edit.length]);
            }
            vdata1.push(vcol);
            vdata2.push(vcol_user);
        }
        break;
        case 'cursor click':
        bctitle1 = 'Browse students\' overall cursor acts from selected time range';
        bcy = 'Click numbers';
        bcunit = '';
        for (var i =0 ; i < puser.length; i++) {
            var vcol = {}, vcol_user = {};
            vcol['name'] = puser[i].key;
            vcol['drilldown'] = puser[i].key;
            vcol_user['name'] = puser[i].key;
            vcol_user['id'] = puser[i].key;
            vcol_user['data'] = [];
            vcol['y'] = 0;
            vcol['color'] = randomColor();
            for (var j = 0; j < puser[i].values.length; j++) {
                vcol['y'] += puser[i].values[j].clicks;
                vcol_user['data'].push([puser[i].values[j].time.substring(0,10), puser[i].values[j].clicks]);
            }
            vdata1.push(vcol);
            vdata2.push(vcol_user);
        }
        break;
        case 'idle status':
        bctitle1 = 'Browse students\' idle times during logging time from selected time range';
        bcy = 'idle times';
        bcunit = 'times';
        for (var i =0 ; i < puser.length; i++) {
            var vcol = {}, vcol_user = {};
            vcol['name'] = puser[i].key;
            vcol['drilldown'] = puser[i].key;
            vcol_user['name'] = puser[i].key;
            vcol_user['id'] = puser[i].key;
            vcol_user['data'] = [];
            vcol['y'] = 0;
            vcol['color'] = randomColor();
            for (var j = 0; j < puser[i].values.length; j++) {
                vcol['y'] += puser[i].values[j].clicks;
                vcol_user['data'].push([puser[i].values[j].time.substring(0,10), puser[i].values[j].clicks]);
            }
            vdata1.push(vcol);
            vdata2.push(vcol_user);
        }
        break;
        case 'user login':
        bctitle1 = 'Browse students\' logging time';
        bcy = 'Period of time';
        bcunit = '';
        for (var i =0 ; i < puser.length; i++) {
            var vcol = {}, vcol_user = {};
            vcol['name'] = puser[i].key;
            vcol['drilldown'] = puser[i].key;
            vcol_user['name'] = puser[i].key;
            vcol_user['id'] = puser[i].key;
            vcol_user['data'] = [];
            vcol['y'] = 0;
            vcol['color'] = randomColor();
            for (var j = 0; j < puser[i].values.length; j++) {
                vcol['y'] += puser[i].values[j].range;
                vcol_user['data'].push([puser[i].values[j].time.substring(0,10), puser[i].values[j].clicks]);
            }
            vdata1.push(vcol);
            vdata2.push(vcol_user);
        }
        break;
        default:break;
    }
    $('#bc-area').highcharts({
        chart: {
            type: 'column'
        },
        title: {
            text: bctitle1
        },
        subtitle: {
            text: 'Click the columns to view specific user.'
        },
        xAxis: {
            type: 'category'
        },
        yAxis: {
            title: {
                text: bcy
            }

        },
        legend: {
            enabled: false
        },
        plotOptions: {
            series: {
                borderWidth: 0,
                // dataLabels: {
                //     enabled: true,
                //     format: '{point.y:.1f}' + bcunit
                // }
            }
        },

        tooltip: {
            headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
            pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y}</b><br/>'//<b>{point.y:.2f}</b>
        },

        series: [{
            name: bcy,
            colorByPoint: true,
            data: vdata1
        }],
        drilldown: {
            xAxis: { type: 'datetime'},
            series: vdata2
        }
    });
}

var randomColor = function () {
  console.log("enter randomColor");
  var red = Math.floor(Math.random()*128+128).toString(),
  green = Math.floor(Math.random()*128+128).toString(),
  blue = Math.floor(Math.random()*128+128).toString(),
  opacity =(Math.random()+0.4).toFixed(2).toString();
  console.log("rgba("+red+","+green+","+blue+","+opacity+")");
  console.log(("rgba("+red+","+green+","+blue+","+opacity+")").toString());
  return ('rgba('+red+","+green+","+blue+","+opacity+')');
};