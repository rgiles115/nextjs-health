// components/SkeletonLoader.js

function SkeletonLoader() {
    return (
      <div className="space-y-10 animate-pulse">
        {/* Profile and YTD Totals */}
        <div className="m-5 p-4 border border-gray-200 rounded-lg bg-white">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 bg-gray-300 rounded-full"></div>
            <div className="flex-1 space-y-3">
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-300 rounded"></div>
                <div className="h-4 bg-gray-300 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
  
        {/* Placeholder for NumberContainers */}
        <div className="m-5 p-4 border border-gray-200 rounded-lg bg-white space-y-3">
          <div className="h-4 bg-gray-300 rounded w-1/4"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-8 bg-gray-300 rounded"></div>
            <div className="h-8 bg-gray-300 rounded"></div>
          </div>
        </div>
  
        {/* Strava Overview Heading */}
        <div className="px-5">
          <div className="h-6 bg-gray-300 rounded w-1/3"></div>
        </div>
  
        {/* Charts and Analysis */}
        <div className="flex flex-wrap -m-4 px-2.5 py-2.5">
          {/* Chart Skeleton */}
          <div className="flex-1 m-5 border border-gray-200 rounded-lg bg-white h-64"></div>
          
          {/* Analysis Skeleton */}
          <div className="p-4 w-full md:w-1/2">
            <div className="m-5 p-4 border border-gray-200 rounded-lg bg-white h-48"></div>
          </div>
        </div>
      </div>
    );
  }
  
  export default SkeletonLoader;
  