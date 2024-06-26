import React from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMountain, faRoad } from "@fortawesome/free-solid-svg-icons";

interface NumberContainersProps {
    totalDistance: number;
    totalElevationGain: number;
}

const NumberContainers: React.FC<NumberContainersProps> = ({ totalDistance, totalElevationGain }) => {
    // Function to format numbers with thousands separators
    const formatNumber = (number: number) => {
        return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(number);
    };

    return (
        <div className="flex justify-between">
            <div className="flex flex-1 flex-col justify-center items-center mx-4 my-5 border border-gray-200 rounded-lg overflow-hidden bg-white py-2.5">
                <FontAwesomeIcon icon={faRoad} className="icon" style={{ color: "#3567fa" }} />
                <div className="total-distance text-center">
                    <div className={`total-value text-black mb-1 font-bold dynamic-font-size`}>
                        {formatNumber(totalDistance)}
                    </div>
                    <div className="total-title text-base uppercase text-gray-600 tracking-wide">
                        TOTAL KILOMETERS
                    </div>
                </div>
            </div>
            <div className="flex flex-1 flex-col justify-center items-center mx-4 my-5 border border-gray-200 rounded-lg overflow-hidden bg-white py-2.5">
                <FontAwesomeIcon icon={faMountain} className="icon" style={{ color: "#d84bff" }} />
                <div className="total-distance text-center">
                    <div className={`total-value text-black mb-1 font-bold dynamic-font-size`}>
                        {formatNumber(totalElevationGain)}
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
