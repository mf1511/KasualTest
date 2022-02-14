import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import axios from "axios";
import countrycodes from "../../config/countryLoc";

import("./Map.css");

function Map() {
  // const [measurements, setMeasurements] = useState([]);
  const [countries, setCountries] = useState([]);
  const [countryData, setCountryData] = useState([]);
  const [center, setCenter] = useState([46, 2]);

  // On récupère ici les infos d'un seul pays, sur lequel on a cliqué dans le dropdown
  function callCountry(country) {
    axios
      .get(
        `https://u50g7n0cbj.execute-api.us-east-1.amazonaws.com/v2/locations?limit=500&country=${country}`
      )
      .then((res) => setCountryData(res.data));
    const locData = countrycodes.ref_country_codes?.filter(
      (pays) => pays.alpha2 === country
    )[0];
    console.log(countrycodes.ref_country_codes);
    const gpsPoint = {
      lat: locData.latitude,
      lng: locData.longitude,
    };
    setCenter(gpsPoint);
    console.log(gpsPoint);
  }

  //on récupère ici la liste de tous les pays que l'on va mettre dans le dropdown
  useEffect(() => {
    axios
      .get(
        "https://u50g7n0cbj.execute-api.us-east-1.amazonaws.com/v2/countries"
      )
      .then((res) => setCountries(res.data));
    console.log(countries);
  }, []);

  // useEffect(() => {
  //   axios
  //     .get(
  //       "https://u50g7n0cbj.execute-api.us-east-1.amazonaws.com/v2/measurements"
  //     )
  //     .then((res) => setMeasurements(res.data));
  // }, []);

  // permet de recharger la map pour qu'elle s'affiche correctement
  setTimeout(function () {
    window.dispatchEvent(new Event("resize"));
  }, 500);

  return (
    <>
      <div className="header">
        <div className="dropdown">
          <button className="dropbtn">Choix du Pays</button>
          <div className="dropdown-content">
            {countries.results?.map((country) => (
              <p
                id={country.name}
                key={country.name}
                className="country"
                onClick={(e) => callCountry(country.code)}
              >
                {country.name}
              </p>
            ))}
          </div>
        </div>
      </div>
      <div id="map">
        <MapContainer center={center} zoom={6}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {countryData.results?.map((location) => (
            <Marker
              key={location.id}
              position={[
                location.coordinates.latitude,
                location.coordinates.longitude,
              ]}
            >
              <Popup>
                Les données de la qualité de l'air à{" "}
                <strong>{location.name}</strong> sont :
                <br /> Easily customizable.
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* <ul className="measurementList">
        {measurements.results?.map((measure) => (
          <li key={measure.locationId}>{measure.location}</li>
          ))}
        </ul> */}
      </div>
    </>
  );
}

export default Map;
