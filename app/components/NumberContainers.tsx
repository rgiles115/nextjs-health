import React from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMountain, faRoad } from "@fortawesome/free-solid-svg-icons";

interface NumberContainersProps {
    totalDistance: number;
    totalElevationGain: number;
}

const NumberContainers: React.FC<NumberContainersProps> = ({ totalDistance, totalElevationGain }) => {
    return (
        <div className="parent-number-container">
            <div className="number-container">
                <FontAwesomeIcon icon={faRoad} className="icon" style={{ color: "#219ebc" }} />
                <div className="total-distance">
                    <div className="total-value">{totalDistance.toFixed(2)}</div>
                    <div className="total-title">TOTAL KILOMETERS</div>
                </div>
                <div className="divider"></div>
            </div>
            <div className="number-container">
                <FontAwesomeIcon icon={faMountain} className="icon" style={{ color: "#fb8500" }} />
                <div className="total-distance">
                    <div className="total-value">{totalElevationGain}</div>
                    <div className="total-title">TOTAL ELEVATION</div>
                </div>
                <div className="divider"></div>
            </div>
        </div>
    );
};

export default NumberContainers;
