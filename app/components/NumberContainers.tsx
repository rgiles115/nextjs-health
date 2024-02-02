import React from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMountain, faRoad } from "@fortawesome/free-solid-svg-icons";

interface NumberContainersProps {
    totalDistance: number;
    totalElevationGain: number;
}

const NumberContainers: React.FC<NumberContainersProps> = ({ totalDistance, totalElevationGain }) => {
    return (
        <div className="flex justify-between">
            <div className="flex flex-1 flex-col justify-center items-center mx-5 my-5 border border-gray-200 rounded-lg overflow-hidden bg-white py-2.5">
                <FontAwesomeIcon icon={faRoad} className="icon" style={{ color: "#219ebc" }} />
                <div className="total-distance text-center">
                    <div className={`total-value text-black mb-1 font-bold dynamic-font-size`}>
                        {totalDistance.toFixed(2)}
                    </div>
                    <div className="total-title text-base uppercase text-gray-600 tracking-wide">
                        TOTAL KILOMETERS
                    </div>
                </div>
            </div>
            <div className="flex flex-1 flex-col justify-center items-center mx-5 my-5 border border-gray-200 rounded-lg overflow-hidden bg-white py-2.5">
                <FontAwesomeIcon icon={faMountain} className="icon" style={{ color: "#fb8500" }} />
                <div className="total-distance text-center">
                    <div className={`total-value text-black mb-1 font-bold dynamic-font-size`}>
                        {totalElevationGain}
                    </div>
                    <div className="total-title text-base uppercase text-gray-600 tracking-wide">
                        TOTAL ELEVATION
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NumberContainers;
