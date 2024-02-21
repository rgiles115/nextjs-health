// components/OuraSkeletonLoader.js

function OuraSkeletonLoader() {
    return (
        <div className="space-y-1 animate-pulse">

            {/* Oura Readiness Heading */}
            <div className="px-5">
                <div className="h-10 bg-gray-300 rounded w-1/3 animate-pulse"></div>
            </div>

            {/* Charts and Analysis */}
            <div className="flex flex-wrap -m-4 px-2.5 py-1">
                {/* Chart Skeleton */}
                <div className="flex-1 m-5 border border-gray-200 rounded-lg bg-white h-64 animate-pulse"></div>

                {/* Analysis Skeleton */}
                <div className="p-4 w-full md:w-1/2">
                    <div className="m-5 p-4 border border-gray-200 rounded-lg bg-white h-48 animate-pulse"></div>
                </div>
            </div>
            {/* Oura Activity & Sleep Heading */}
            <div className="px-5">
                <div className="h-10 bg-gray-300 rounded w-1/3 animate-pulse"></div>
            </div>
            {/* Charts and Analysis */}
            <div className="flex flex-wrap -m-4 px-2.5 py-2.5">
                {/* Chart Skeleton */}
                <div className="flex-1 m-5 border border-gray-200 rounded-lg bg-white h-64 animate-pulse"></div>

                {/* Analysis Skeleton */}
                <div className="p-4 w-full md:w-1/2">
                    <div className="m-5 p-4 border border-gray-200 rounded-lg bg-white h-48 animate-pulse"></div>
                </div>
            </div>
        </div>
    );
}

export default OuraSkeletonLoader;
