import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import axios from "axios";
import { countryCodes } from "../../config/countryLoc";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

import("./Map.css");

function Map() {
  const [countries, setCountries] = useState([]);
  const [countryData, setCountryData] = useState([]);
  const [center, setCenter] = useState([46, 2]);
  const [locNumber, setLocNumber] = useState("10");
  const [countrySelected, setcountrySelected] = useState("FR");

  // On récupère ici les infos d'un seul pays (toutes les localisations des capteurs de qualité d'air + mesures etc.), sur lequel on a cliqué dans le dropdown
  useEffect(() => {
    axios
      .get(
        `https://u50g7n0cbj.execute-api.us-east-1.amazonaws.com/v2/locations?limit=${locNumber}&country=${countrySelected}`
      )
      .then((res) => setCountryData(res.data));

    // On récupère ici les coordonnées du PAYS dans le fichier "countryLoc.js" en fonction du pays que nous avons choisi dans le dropdown
    const locData = countryCodes?.filter(
      (pays) => pays.alpha2 === countrySelected
    )[0];

    return () => console.log("");
  }, [countrySelected, locNumber]); //On relance useEffect à chaque changement de pays ou de nombre d'emplacements voulus

  //on récupère ici la liste de tous les pays que l'on va mettre dans le dropdown
  useEffect(() => {
    axios
      .get(
        "https://u50g7n0cbj.execute-api.us-east-1.amazonaws.com/v2/countries"
      )
      .then((res) => setCountries(res.data));
  }, []);

  // permet de recharger la map pour qu'elle s'affiche correctement
  setTimeout(function () {
    window.dispatchEvent(new Event("resize"));
  }, 500);

  return (
    <>
      {/* On crée ici le bouton dropdown qui nous permet de choisir le pays que l'on souhaite */}
      <div className="header">
        <p className="sensorName">Nombre de capteurs</p>
        <input
          type="range"
          min="1"
          max="1200"
          rangevalue="500"
          onChange={(e) => setLocNumber(e.target.value)}
        />
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
      </div>

      {/* On intègre ici la map */}
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
                Les données de la qualité de l'air à
                <strong> {location.name}</strong> sont :
                {location.parameters?.map((param) => (
                  <li key={param.id}>
                    {" "}
                    Paramètre : {param.displayName}, Valeur : {param.lastValue}{" "}
                  </li>
                ))}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </>
  );
}

export default Map;
