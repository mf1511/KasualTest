import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import axios from "axios";
import { countryCodes } from "./config/countryLoc";
import React, { useEffect, useState } from "react";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import "./App.css";

function App() {
  const [countries, setCountries] = useState([]);
  const [countryData, setCountryData] = useState([]);
  const [center, setCenter] = useState([46, 2]);
  const [countrySelected, setcountrySelected] = useState("FR");
  const [selectedRadio, setSelectedRadio] = useState("pm10"); //parameter user choice
  const [parameter, setParameter] = useState(""); //dropdown button choices
  const [valueFrom, setValueFrom] = useState("0");

  const countryDataFilter = countryData.map((item) => {
    return item.parameter;
  });

  const parametersArray = Object.values(parameter);
  const res = parametersArray.filter((item) =>
    countryDataFilter.includes(item.name)
  );

  // On récupère a valeur mini et maxi de la mesure
  countryData.sort(function (a, b) {
    return a.value - b.value;
  });
  var min = Math.round((countryData[0]?.value * 100) / 100);
  var max = countryData[countryData.length - 1]?.value;

  const [loading, setLoading] = useState(true);

  // on récupère ici la liste de tous les pays que l'on va mettre dans le dropdown
  useEffect(() => {
    axios
      .get(
        "https://u50g7n0cbj.execute-api.us-east-1.amazonaws.com/v2/countries"
      )
      .then((res) => setCountries(res.data));
  }, []);

  // on récupère ici la liste de tous les paramètres que l'on va mettre dans le dropdown
  useEffect(() => {
    const paramGet = async () => {
      const responseParam = await axios.get(
        "https://u50g7n0cbj.execute-api.us-east-1.amazonaws.com/v2/parameters"
      );
      const parameters = responseParam.data.results;
      setParameter(parameters);
    };
    paramGet();
  }, [countrySelected]);

  // On récupère ici les infos d'un seul pays (toutes les localisations des capteurs de qualité d'air + mesures etc.), sur lequel on a cliqué dans le dropdown
  useEffect(() => {
    const axiosGet = async () => {
      setLoading(true);
      try {
        const responseGlobal = await axios.get(
          `https://docs.openaq.org/v2/measurements?country=${countrySelected}`
        );
        setCountryData(responseGlobal.data.results);
      } catch (error) {
        console.error(error.message);
      }
      setLoading(false);
    };
    axiosGet();

    const countryChoice = countryCodes.filter((country) =>
      country.alpha2?.includes(countrySelected)
    );

    const lat = countryChoice[0].latitude;
    const long = countryChoice[0].longitude;

    setCenter([lat, long]);
  }, [countrySelected, selectedRadio]); //On relance useEffect à chaque changement de pays ou de nombre d'emplacements voulus

  return (
    <div className="mapContainer">
      {loading && <div className="loading">Loading</div>}
      {!loading && (
        <div>
          <div className="header">
            <div className="paysContainer">
              <div className="dropdown">
                <button className="dropbtn">
                  Choix du Pays <ArrowDropDownIcon className="dropbtn__arrow" />
                </button>
                <div className="dropdown-content">
                  {countries.results?.map((country) => (
                    <p
                      id={country.name}
                      key={country.name}
                      className="country"
                      onClick={() => setcountrySelected(country.code)}
                    >
                      {country.name}
                    </p>
                  ))}
                </div>
              </div>
              <p>Pays affiché : {countrySelected}</p>
            </div>
            <div className="parametersContainer">
              <div className="dropdown">
                <button className="dropbtn">
                  Choix du paramètre{" "}
                  <ArrowDropDownIcon className="dropbtn__arrow" />
                </button>
                <div className="dropdown-content">
                  {res?.map((radio) => (
                    <p
                      id={radio}
                      key={radio.id}
                      className="country"
                      onClick={() => setSelectedRadio(radio.name)}
                    >
                      {radio.displayName}
                    </p>
                  ))}
                </div>
              </div>
              <p>Paramètre affiché : {selectedRadio}</p>
            </div>
            <div className="sensorValueContainer">
              <p className="sensorValue">Mesures</p>
              <div className="sensorValueDetails">
                <div className="sensorValueMinMax">
                  Valeurs mini et maxi : {min + ", " + max}
                </div>
                <div className="sensorValueRange">
                  <p>Triage avec valeur mini:</p>
                  <input
                    type="range"
                    min={min}
                    max={max}
                    rangevalue={max}
                    onChange={(e) => setValueFrom(e.target.value)}
                  />
                  <p>{valueFrom}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="App">
            <div id="map">
              <MapContainer center={center} zoom={6}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {countryData
                  .filter((country) =>
                    country.parameter?.includes(selectedRadio)
                  )
                  .filter((country) =>
                    country.country?.includes(countrySelected)
                  )
                  .filter((country) => country.value >= valueFrom)
                  .map((location) => (
                    <Marker
                      key={location.locctionId}
                      position={[
                        location.coordinates.latitude,
                        location.coordinates.longitude,
                      ]}
                    >
                      <Popup>
                        Lieu : {location.location + ", " + location.country}
                        <br />
                        Le paramètre de qualité de l'air relevé ici est :
                        <strong>
                          {" " + location.parameter + " "} <br />
                        </strong>
                        Sa valeur est de {location.value + " "}
                        {location.unit}
                        <br />
                        Mesure relevée le : {location.date.local + " " + "UTC"}
                      </Popup>
                    </Marker>
                  ))}
              </MapContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
