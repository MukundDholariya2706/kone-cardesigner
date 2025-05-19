import './Map.scss'
import React, { useEffect, useState } from 'react'
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup
} from "react-simple-maps"
import { geoPath } from "d3-geo"
import { geoTimes } from "d3-geo-projection"

const CLASS_NAME_SELECTED = 'rsm-geography-selected'

const Map = ({ countryCode }) => {

  const [ zoom, setZoom ] = useState(1)
  const [ geographiesData, setGeographiesData ] = useState()
  const [ center, setCenter ] = useState([0,0])

  const updateZoom = () => {
    
    if (!geographiesData) {
      return
    }

    if (!countryCode) {
      setCenter([0, 0])
      setZoom(1)
      return
    }
    
    const width = 800
    const height = 450
    const geography = geographiesData.find(item => item && item.properties && item.properties.ISO_A3 === countryCode)

    if (!geography) {
      setCenter([0, 0])
      setZoom(1)
      return
    }

    const projection = () => {
      return geoTimes().translate([width / 2, height / 2]).scale(160)
    }

    const path = geoPath().projection(projection())
    const centroid = projection().invert(path.centroid(geography))

    // calculate zoom level
    const bounds = path.bounds(geography);
    const dx = bounds[1][0] - bounds[0][0];
    const dy = bounds[1][1] - bounds[0][1];
    const zoom = 0.5 / Math.max(dx / width, dy / height);

    const clampedZoom = Math.max( Math.min(zoom, 50), 1 )
    
    // update stroke-width based on zoom level
    const elements = document.getElementsByClassName('rsm-geography');
    for (const element of elements) {
      element.style.strokeWidth = 0.5 / clampedZoom;
    }

    setCenter(centroid)
    setZoom(clampedZoom)
  }

  useEffect(() => {
    
    // remove old selections
    const selectedElements = document.getElementsByClassName(CLASS_NAME_SELECTED);
    while(selectedElements.length > 0) {
      selectedElements[0].classList.remove(CLASS_NAME_SELECTED);
    }

    if (!countryCode) {
      return
    }

    const selectMapElementsByLanguageCode = (code) => {
      // add new selection
      const elements = document.getElementsByClassName(code);
      if (elements && elements.length) {
        for (const element of elements) {
          if (element && element.classList && !element.classList.contains(CLASS_NAME_SELECTED)) {
            element.classList.add(CLASS_NAME_SELECTED);
          }
        }
      }
    }

    selectMapElementsByLanguageCode(countryCode)

    // Special handling for china ...
    // add Taiwan to China selection
    if (countryCode === 'CHN') {
      selectMapElementsByLanguageCode('TWN')
    }

    if (countryCode === 'CYP') {
      selectMapElementsByLanguageCode('CYPN')
    }

    updateZoom()

  }, [ countryCode ])

  useEffect(() => {
    updateZoom()
  }, [geographiesData])

  const isGeographySelected = (selectedCode, code) => {
    if (!selectedCode || !code) {
      return false
    }

    if (selectedCode === code) {
      return true      
    }
    // Special handling for china ...
    // add Taiwan to China selection
    if (selectedCode === 'CHN' && code === 'TWN') {
      return true      
    }

    // Special handling for cyprus ...
    // add Southern and Northen Cyprus selection
    if (selectedCode === 'CYP' && code === 'CYPN') {
      return true      
    }
    return false
  }

  return (
    <div className="Map">
      <ComposableMap>
        <ZoomableGroup
          center={ center }
          zoom={ zoom }
        >
          <Geographies className={countryCode} geography={ "topojson-map-file.json" } on>
            {(geographies, projection) => {

              // Work around of issue: Cannot update a component while rendering a different component...
              geographies && geographies.length && setTimeout(() => {
                setGeographiesData(geographies)
              })

              return geographies.map((geography, index) => {

                const { properties } = geography || {}
                const { ISO_A3 } = properties || {}

                if (ISO_A3 === 'ATA') {
                  return null
                }

                return (              
                  <Geography
                    key={ index }
                    className={ `rsm-geography ${ISO_A3}` + ( isGeographySelected(countryCode, ISO_A3) ? ` ${CLASS_NAME_SELECTED}` : '') }
                    geography={ geography }
                    projection={ projection }
                  />
                )
              })              
            }}
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>
    </div>
  )
}

export default Map