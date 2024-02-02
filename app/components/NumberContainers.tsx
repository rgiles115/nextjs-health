import React from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMountain, faRoad } from "@fortawesome/free-solid-svg-icons";
import dynamic from 'next/dynamic';


interface NumberContainersProps {
    totalDistance: number;
    totalElevationGain: number;
}

const NumberContainers: React.FC<NumberContainersProps> = ({ totalDistance, totalElevationGain }) => {
    return (
        <div className="flex justify-between">
            <div className="flex flex-1 flex-col justify-center items-center mx-5 my-5 border border-gray-200 rounded-lg overflow-hidden bg-white py-2.5">
                <FontAwesomeIcon icon={faRoad} className="icon" style={{ color: "#219ebc" }} />
                <div className="total-distance">
                    <div className="total-value">{totalDistance.toFixed(2)}</div>
                    <div className="total-title">TOTAL KILOMETERS</div>
                </div>
                <div className="divider"></div>
            </div>
            <div className="flex flex-1 flex-col justify-center items-center mx-5 my-5 border border-gray-200 rounded-lg overflow-hidden bg-white py-2.5">
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
