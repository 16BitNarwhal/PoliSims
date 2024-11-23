import React from "react"
import CanadaMap from "react-canada-map"

function App() {
  const mapClickHandler = (province, event) => {
    console.log("province clicked: ", province)
  }

  return (
    <CanadaMap
      fillColor="ForestGreen"
      onHoverColor="Gold"
      onClick={mapClickHandler}
    ></CanadaMap>
  )
}

export default App