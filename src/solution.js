const dayjs = require("dayjs");
const { API_URL } = require("./constants");

/**
 * This gets the data from the spaceX API
 * @returns
 */
const getData = () => {
  return fetch(API_URL)
  .then(response => response.json())
  .then((response) => {
    return response;
  });
};

/**
 * Filters all the mission which happened on 2018 and belong to any of NASA projects
 * @param {*} data 
 * @returns 
 */
const filterData = (data) => {
  return data.filter(mission => {
    const missionYear = dayjs(mission.launch_date_utc).format("YYYY");
    const {
      rocket: {
        second_stage: {
          payloads,
        }
      }
    } = mission;
    const customers = payloads.map(item => item.customers);
    const flattened = [].concat.apply([], customers);
    let isNasaMission = false;

    // Since we need to display all the missions which belongs NASA but different projects
    // We have to check if NASA is part of the customer string, if yes then we consider it as NASA projects
    for (let i = 0; i < flattened.length; i++) {
      const customer = flattened[i];
      if (customer.indexOf('NASA') > -1) {
        isNasaMission = true;
        break;
      }
    }
    // This filters all the mission happened in 2018
    return missionYear === "2018" && isNasaMission;
  });
};

/**
 * The missions are mapped by payload count
 * @param {*} data 
 * @returns 
 */
const mapMissionsByPayloadCount = (data) => {
  const mapByPayloadCount = {};
  data.forEach((item) => {
    const {
      rocket: {
        second_stage: {
          payloads,
        }
      }
    } = item;
    const count = payloads.length;
    if (!mapByPayloadCount[count]) {
      mapByPayloadCount[count] = [item];
    } else {
      mapByPayloadCount[count].push(item);
    }
  });

  return mapByPayloadCount;
};

/**
 * Sorts the data by mapping the missions by payload 
 * count and then sort the missions for each
 * payload count by simple sort function
 */
const sortData = (data) => {
  let sorted = [];
  const mapByPayloadCount = mapMissionsByPayloadCount(data);
  const keys = Object.keys(mapByPayloadCount).reverse();
  keys.forEach(key => {
    const missionsByCount = mapByPayloadCount[key];
    const sortedMissions = missionsByCount.sort((x, y) => y.launch_date_unix - x.launch_date_unix);
    sorted = sorted.concat(sortedMissions);
  });
  return sorted;
};

/**
 * This function gets the data from the SpaceX API and
 * prepares it before rendering
 */
const prepareData = (data) => {
  const filtered = filterData(data);
  const sorted = sortData(filtered);
  return sorted.map(({flight_number, mission_name, rocket}) => {
    const {
      second_stage: {
        payloads,
      }
    } = rocket;
    return {
      flight_number,
      mission_name,
      payloads_count: payloads.length,
    }
  });
};

/**
 * This function renders data in the respective div element
 */
const renderData = (data) => {
  const outputElement = document.getElementById("out");
  outputElement.innerHTML = JSON.stringify(data, null, '  ');
};

module.exports = {
  getData,
  prepareData,
  renderData
};
