import React, { useEffect, useState } from "react";
import MapGL, { Marker } from "react-map-gl";
import { Button, TextField } from "@material-ui/core";
import { w3cwebsocket as W3CWebSocket } from "websocket";

// Create a websocket client
const client = new W3CWebSocket("ws://127.0.0.1:8000");

// This token will need to be replaced when traffic limit is exceeded
const MAPBOX_TOKEN =
  "pk.eyJ1IjoibWNhd3RlIiwiYSI6ImNrZzM0am5tZjA3N2IycWxuc2Iyc25mb3oifQ.OBCOBXj9W2BEcsJurgRCVw"; // Set your mapbox token here

interface MapProps {
  id: string;
  timestamp_utc: string;
  lng: string;
  lat: string;
  timezone: string[];
  datetime: string;
  distance: string;
}

export const Map: React.FC<{}> = () => {
  client.onopen = () => {
    console.log("WebSocket Client Connected");
  };

  // Initial parameters for map
  const [viewport, setViewport] = useState({
    latitude: 16.8,
    longitude: 100.4,
    zoom: 1,
    bearing: 0,
    pitch: 0,
  });

  // state getters and setters for assets
  const [assets, setAssets] = useState([]);
  const [newAsset, setNewAsset] = useState({
    id: "",
    lat: "",
    lng: "",
  });

  // Using a randomly generated uuid for initial state. Not for production
  const [toolTip, setToolTip] = useState(
    "aa24f332-28e2-435e-ae9b-a1b164e47ada"
  );

  // This effect re-renders all the assets on the map when the server sends new
  // assets via websockets
  useEffect(() => {
    client.onmessage = (message) => {
      var result = JSON.parse(String(message.data));
      document.title = `Tracking ${result.length} assets`;
      setAssets(result);
    };
    //return () => client.close();
  }, []);

  // Convenience function in lieu of proper validation
  function beginsWithFloat(val: string) {
    var parsed_val = parseFloat(val);
    return !isNaN(parsed_val);
  }

  // Send the new asset to the server via websockets.
  // Checks to make sure id is not null and lat and lng are floats
  function sendAssetToServer() {
    console.log(JSON.stringify(newAsset));
    if (
      newAsset.id !== "" &&
      beginsWithFloat(newAsset.lat) &&
      beginsWithFloat(newAsset.lng)
    ) {
      console.log("Sending asset to server");
      if (client.readyState === client.OPEN) {
        client.send(JSON.stringify(newAsset));
        return;
      }
    }
  }

  // This obtains the asset that currently has the mouse over it. Does not
  // currently account for assets with the same id but different check-in times
  var checkin: MapProps = assets.find(
    (asset: MapProps) => asset.id === toolTip
  )!;

  return (
    <>
      <TextField
        id="id"
        label="id"
        type="string"
        required={true}
        value={newAsset.id}
        onChange={(e) => {
          setNewAsset({ ...newAsset, id: e.target.value });
        }}
      />
      <TextField
        id="lat"
        label="lat"
        type="number"
        required={true}
        value={newAsset.lat}
        onChange={(e) => {
          setNewAsset({ ...newAsset, lat: e.target.value });
        }}
      />
      <TextField
        id="lng"
        label="lng"
        type="number"
        required={true}
        value={newAsset.lng}
        onChange={(e) => {
          setNewAsset({ ...newAsset, lng: e.target.value });
        }}
      />
      <Button color="primary" onClick={sendAssetToServer} style={{
        borderRadius: 25,
        backgroundColor: "#21b6ae",
        padding: "8px 16px",
        fontSize: "12px"
    }}>
        Add Asset
      </Button>
      <MapGL
        {...viewport}
        width="70vw"
        height="95vh"
        mapStyle="mapbox://styles/mapbox/streets-v9"
        onViewportChange={(nextViewport) => setViewport(nextViewport)}
        mapboxApiAccessToken={MAPBOX_TOKEN}
      >
        {assets.map((item: MapProps) => (
          <Marker
            latitude={parseFloat(item.lat)}
            longitude={parseFloat(item.lng)}
            offsetLeft={0}
            offsetTop={0}
          >
            <Button color="primary" size="small">
              <span
                role="img"
                aria-label="marker"
                onMouseEnter={() => setToolTip(item.id)}
                onMouseLeave={() =>
                  setToolTip("aa24f332-28e2-435e-ae9b-a1b164e47ada")
                }
              >
                📍
              </span>
              {item.id}
            </Button>
          </Marker>
        ))}

        {toolTip !== "aa24f332-28e2-435e-ae9b-a1b164e47ada" && (
          <>
            <div>Asset checked in at {checkin!.datetime}</div>
            <div>
              Distance traveled since last check-in: {checkin!.distance} km
            </div>
          </>
        )}
      </MapGL>
    </>
  );
};
