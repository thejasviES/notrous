
//here we are getting the dataset-location variable that from the tour.pug 

export const displayMap=(locations)=>{

  mapboxgl.accessToken = 'pk.eyJ1IjoidGhlamFzdmkiLCJhIjoiY2xtcTdkNTJoMDB2azJscGZveHR3Z3RwayJ9.JPUVRk6pUOpDjmQY4o9gCA';
  var map = new mapboxgl.Map({
    container: 'map',
    style: "mapbox://styles/thejasvi/clmq7kupt021201nz00r3gjlu",
    scrollZoom: false
    // centre:[-118.28887753057084,34.101910499657905],
    // zoom:6,
    // interactive:false
  });
  const bounds = new mapboxgl.LngLatBounds();
  locations.forEach(loc => {
    // Create marker
    const el = document.createElement('div');
    el.className = 'marker';
  
    // Add marker
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom'
    })
      .setLngLat(loc.coordinates)
      .addTo(map);
  
    // Add popup
    new mapboxgl.Popup({
      offset: 30
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);
  
    // Extend map bounds to include current location
    bounds.extend(loc.coordinates);
  });
  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100
    }
  });
  
  
}