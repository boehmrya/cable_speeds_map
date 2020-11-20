var state_id =  {
    '01': 'AL',
    '02': 'AK',
    '04': 'AZ',
    '05': 'AR',
    '06': 'CA',
    '08': 'CO',
    '09': 'CT',
    '10': 'DE',
    '11': 'DC',
    '12': 'FL',
    '13': 'GA',
    '15': 'HI',
    '16': 'ID',
    '17': 'IL',
    '18': 'IN',
    '19': 'IA',
    '20': 'KS',
    '21': 'KY',
    '22': 'LA',
    '23': 'ME',
    '24': 'MD',
    '25': 'MA',
    '26': 'MI',
    '27': 'MN',
    '28': 'MS',
    '29': 'MO',
    '30': 'MT',
    '31': 'NE',
    '32': 'NV',
    '33': 'NH',
    '34': 'NJ',
    '35': 'NM',
    '36': 'NY',
    '37': 'NC',
    '38': 'ND',
    '39': 'OH',
    '40': 'OK',
    '41': 'OR',
    '42': 'PA',
    '44': 'RI',
    '45': 'SC',
    '46': 'SD',
    '47': 'TN',
    '48': 'TX',
    '49': 'UT',
    '50': 'VT',
    '51': 'VA',
    '53': 'WA',
    '54': 'WV',
    '55': 'WI',
    '56': 'WY'
  };


// to handle lookups to detect when small states are clicked
var small_states =  {
    'VT': 'Vermont',
    'NH': 'New Hampshire',
    'MA': 'Massachusetts',
    'RI': 'Rhode Island',
    'CT': 'Connecticut',
    'NJ': 'New Jersey',
    'DE': 'Delaware',
    'MD': 'Maryland',
    'DC': 'District of Columbia'
};


$(function($){

  var w, width, height, wScale, hScale, mapSize, mapRatio;

  w = $(window).width();
  //Width and height of map
  width = parseInt(d3.select('#state-map').style('width'));

  mapRatio = .71
  height = width * mapRatio;
  viewBox = "0 0 " + width + " " + height;


  // D3 Projection
  var projection = d3.geo.albersUsa()
  				   .translate([width/2, height/2.2])    // translate to center of screen
  				   .scale([1.4 * width]);          // scale things down so see entire US

  // Define path generator
  var path = d3.geo.path()               // path generator that will convert GeoJSON to SVG paths
  		  	 .projection(projection);  // tell path generator to use albersUsa projection


  //Create SVG element and append map to the SVG
  var svg = d3.select("#state-map")
  			.append("svg")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", viewBox);

  // Load GeoJSON for US States
  d3.json("../maps/us-states.json", function(json) {

    // Bind the data to the SVG and create one path per GeoJSON feature
    // This builds the map
    svg.selectAll("path")
      .data(json.features)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("id", function(d) { return state_id[d.id]; })
      .attr("class", function(d) {
        if (state_id[d.id] == 'AL') {
          return 'state active';
        }
        else {
          return 'state';
        }
      })
      .style("cursor", "pointer")
      .style("stroke", "#343F49")
      .style("stroke-width", "1.5")
      .style("fill", function(d) {
        if (state_id[d.id] == 'AL') {
          return '#5AC9E7';
        }
        else {
          return '#fff';
        }
      })
      .on('mouseover', function(d, i) {
        if (!d3.select(this).classed('active')) {
          d3.select(this).style('fill', '#5AC9E7'); // change to blue on hover
        }
      })
      .on('mouseout', function(d, i) {
        if (!d3.select(this).classed('active')) {
          d3.select(this).style('fill', '#fff'); // remove blue
        }
      })
      .on('click', function(d, i) {
        d3.selectAll('path').classed('active', false); // remove active classes
        d3.selectAll('path').style({ 'fill': '#fff' }); // clear all colors
        d3.select(this).classed('active', true); // add active class to current element
        d3.select(this).style('fill', '#5AC9E7'); // fill current clicked state with blue

        // clear colors on all existing small boxes
        $('#small-states .small-state .box').css('background', '#fff');

        // check if it is a small state
        // if so, find the box and make it blue
        if (small_states.hasOwnProperty(state_id[d.id])) {
          var state_box_id = '#' + state_id[d.id] + '-Box';
          $(state_box_id).css('background', '#5AC9E7');
        }

        // update the select list to the chosen state
        $("#filterFormStateSelect").val(state_id[d.id]).trigger('change');
        // run update data function
        updateData(state_id[d.id]);
      });

      updateData('AL');
      $('#AL').trigger('click');

    });

    // trigger map click events on select list change events
    $("#filterFormStateSelect").change(function() {
      $("#filterFormStateSelect option:selected").each(function(){
        var selected = $(this).val();
        var selected_elem = '#state-map svg #' + selected;

        // update the map
        d3.selectAll('path').classed('active', false); // remove active classes
        d3.selectAll('path').style({ 'fill': '#fff' }); // clear all colors
        d3.select(selected_elem).classed('active', true); // add active class to current element
        d3.select(selected_elem).style('fill', '#5AC9E7'); // fill current clicked state with blue

        // clear colors on all existing small boxes
        $('#small-states .small-state .box').css('background', '#fff');

        // check if it is a small state
        // if so, find the box and make it purple
        if (small_states.hasOwnProperty(selected)) {
          var state_box_id = '#' + selected + '-Box';
          $(state_box_id).css('background', '#5AC9E7');
        }

        // update data in sidebar
        updateData(selected);
      });
    });

    // update information in sidebar card
    // runs when dot is clicked or option in dropdown is selected
    function updateData(state_id) {
      // get location from dict
      var state = data_states[state_id];

      // fill data columns
      $('#jobs-data').text(state.jobs);
      $('#employees-data').text(state.employees);
      $('#economic-impact-data').text(state.total);


      // fill in cale isps with name and link
      // first, empty out the block
      $("#isp-operator-names").empty();

      // Loading provider names into array to allow alpha sorting of provider images (quickfix - this module is not tied to its own Drupal admin sort preference...)
      var providerNames = [];
      $.each(data_states[state_id].providers, function(i,v) {
           providerNames.push(this.name);
      });

      providerNames.sort();

      for(var q=0; q < providerNames.length; q++) {
          $.each(data_states[state_id].providers, function(i,v) {
              if(this.name == providerNames[q])
                $("#isp-operator-names").append("<div class=\"provider\"><a href=\"" + this.link + "\" target=\"_blank\">" + this.name + "</a></div>");
          });
      }
    }
    // end updateData function

    // convert select list into custom menu
    $('#filterFormStateSelect').select2();

    // trigger events when small boxes are clicked
    $('#small-states .small-state .box').on('click', function() {
      // clear colors on all existing small boxes
      $('#small-states .small-state .box').css('background', '#fff');

      // make background of this small box purple
      $(this).css('background', '#5AC9E7');

      // split the id on the box to get the state abbreviation
      var box_id = $(this).attr('id');
      var box_id_parts = box_id.split("-");
      var box_state = box_id_parts[0];

      // set value in the select list and trigger an on change event
      $("#filterFormStateSelect").val(box_state).trigger('change');
    });

  });
