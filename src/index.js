const { getData, prepareData, renderData } = require("./solution");

// Gets the data from SpaceX API, prepares and renders the data
getData()
.then((missions) => {
  const data = prepareData(missions);
  renderData(data);
});
