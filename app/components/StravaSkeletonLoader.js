// components/StravaSkeletonLoader.js

function StravaSkeletonLoader() {
  return (
    <div className="space-y-1 animate-pulse">
      {/* Profile and YTD Totals - Adjusted for double height */}
      <div className="m-5 p-8 border border-gray-200 rounded-lg bg-white"> {/* Increased padding for larger inner space */}
        <div className="flex items-center space-x-4">
          <div className="h-16 w-16 bg-gray-300 rounded-full"></div> {/* Doubled height and width for the profile */}
          <div className="flex-1 space-y-6"> {/* Increased spacing between lines */}
            <div className="h-8 bg-gray-300 rounded w-3/4"></div> {/* Doubled height for the title line */}
            <div className="space-y-4"> {/* Increased spacing for line items */}
              <div className="h-8 bg-gray-300 rounded"></div> {/* Doubled height for detail lines */}
              <div className="h-8 bg-gray-300 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Placeholder for NumberContainers */}
      <div className="m-5 p-4 pb-8 mb-16 border border-gray-200 rounded-lg bg-white space-y-3">
        <div className="h-8 bg-gray-300 rounded w-1/4"></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-8 bg-gray-300 rounded"></div>
          <div className="h-8 bg-gray-300 rounded"></div>
        </div>
      </div>

      {/* Strava Overview Heading */}
      <div className="px-5 mt-32">
        <div className="h-10 bg-gray-300 rounded w-1/3"></div>
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

export default StravaSkeletonLoader;
