// components/OuraSkeletonLoader.js

function OuraSkeletonLoader() {
    return (
        <div className="space-y-1 animate-pulse">

            {/* Charts and Analysis */}
            <div className="flex flex-wrap -m-4 px-2.5 py-1">
                {/* Chart Skeleton */}
                <div className="flex-1 m-5 border border-gray-200 rounded-lg bg-white h-64 animate-pulse"></div>

            </div>
            {/* Oura Activity & Sleep Heading */}
            <div className="px-5">
                <div className="h-10 bg-gray-300 rounded w-1/3 animate-pulse"></div>
            </div>
            {/* Charts and Analysis */}
            <div className="flex flex-wrap -m-4 px-2.5 py-2.5">
                {/* Chart Skeleton */}
                <div className="flex-1 m-5 border border-gray-200 rounded-lg bg-white h-64 animate-pulse"></div>

            </div>
        </div>
    );
}

export default OuraSkeletonLoader;
