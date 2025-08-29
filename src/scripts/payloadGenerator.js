const generatePayloadPriceSearchEncrypt = () => {
  const departure = getDepartureLocation();
  const arrival = getDestinationLocation();
  const nights = getStayNights();
  const filters = getAdditionalFilters();

  const payload = {
    beginDates: [selectedValues.date],
    arrivalLocations: arrival,
    departureLocations: [departure],
    nights: nights,
    datePickerMode: 0,
    roomCriterias: [
      {
        passengers: [
          {
            age: 20,
            passengerType: 0,
          },
          {
            age: 20,
            passengerType: 0,
          },
        ],
      },
    ],
    reservationType: 1,
    paging: {
      pageNumber: 1,
      pageSize: 20,
      sortType: 0,
    },
    additionalFilters: filters || [],
    imageSizes: [4],
  };

  return payload;
};

const generatePayloadPriceSearchList = (priceSearchEncryptResponse) => {
  viewAllUrl = `https://www.coraltravel.lv${priceSearchEncryptResponse.result.redirectionUrl}?qp=${priceSearchEncryptResponse.result.queryParam}&p=1&w=0&s=0&ws=10`;

  const payload = {
    queryParam: priceSearchEncryptResponse.result.queryParam,
    notIncludeFilters: false,
    searchSource: 0,
    getOnlyTopHotels: false,
    dontSearchTopHotels: true,
  };

  return payload;
};

const getDepartureLocation = () =>
  departuresConstants.find(
    (departure) => departure.friendlyUrl === selectedValues.departure
  );

const getDestinationObj = () =>
  destinationsConstants.find(
    (destination) => destination.friendlyUrl === selectedValues.destination
  );

const getDestinationLocation = () => {
  const destinationObj = getDestinationObj();

  if (!destinationObj.children) {
    return [
      {
        id: destinationObj.id,
        type: destinationObj.type,
        name: destinationObj.name,
        friendlyUrl: destinationObj.friendlyUrl,
      },
    ];
  }
  const matchedDestination = offersObj.destinations.find(
    (dest) =>
      dest.destinationDisplayName.toLowerCase() ===
        destinationObj.friendlyUrl &&
      dest.destination?.some((city) =>
        city.beginDates?.filter(
          (dateObj) => dateObj.date === selectedValues.date
        )
      )
  );

  const offerCityNames =
    matchedDestination?.destination
      .filter((city) =>
        city.beginDates?.some((dateObj) => dateObj.date === selectedValues.date)
      )
      .map((city) => city.name) || [];

  const matchingChildren = destinationObj.children.filter((child) =>
    offerCityNames.includes(child.friendlyUrl)
  );

  const destination = matchingChildren.map((child) => ({
    ...child,
    parent: {
      id: destinationObj.id,
      type: destinationObj.type,
      name: destinationObj.name,
      friendlyUrl: destinationObj.friendlyUrl,
    },
  }));

  return destination;
};

const getStayNights = () => {
  const { destination, date } = selectedValues;

  const country = offersObj.destinations.find(
    (c) =>
      c.destinationDisplayName
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase() === destination
  );

  const allStayNights = country.destination.flatMap((city) => {
    return city.beginDates
      .filter((beginDate) => beginDate.date === date)
      .flatMap((beginDate) => beginDate.stayNights);
  });

  const allUniqueStayNights = allStayNights.filter(
    (stayNight, index, self) =>
      index === self.findIndex((sn) => sn.value === stayNight.value)
  );

  allUniqueStayNights.sort((a, b) => a.value - b.value);

  if (allUniqueStayNights.length >= 8) {
    allUniqueStayNights.length = 8;
  }

  return allUniqueStayNights;
};

const getAdditionalFilters = () => {
  return selectedValues.filters;
};
